'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

/* --- TEAM ACTIONS --- */

export async function createTeam(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return { error: "Not authenticated" };

    const name = formData.get('name') as string;
    if (!name) return { error: "Name is required" };

    // 1. Ensure User exists in DB (Upsert)
    const user = await prisma.user.upsert({
        where: { email: session.user.email },
        update: {},
        create: {
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
        }
    });

    // 2. Create Team linked to User and add as Member (Owner)
    await prisma.team.create({
        data: {
            name,
            ownerId: user.id,
            members: {
                create: {
                    userId: user.id,
                    role: 'OWNER'
                }
            }
        }
    });

    revalidatePath('/');
    return { success: true };
}

export async function getUserTeams() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return [];

    // Find user by unique email
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            teams: {
                include: {
                    projects: {
                        include: {
                            _count: {
                                select: { quotes: true }
                            }
                        }
                    }
                }
            },
            memberships: {
                include: {
                    team: {
                        include: {
                            projects: {
                                include: {
                                    _count: {
                                        select: { quotes: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!user) return [];

    // Merge owned teams and joined teams
    const ownedTeams = user.teams;
    const joinedTeams = user.memberships.map(m => m.team);

    // Dedup by ID
    const allTeams = [...ownedTeams, ...joinedTeams];
    const uniqueTeams = Array.from(new Map(allTeams.map(item => [item.id, item])).values());

    return uniqueTeams;
}

export async function inviteMember(teamId: string, email: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "User not found. They must sign up first." };

    const existingMember = await prisma.teamMember.findUnique({
        where: {
            teamId_userId: {
                teamId,
                userId: user.id
            }
        }
    });

    if (existingMember) return { error: "User is already a member" };

    await prisma.teamMember.create({
        data: {
            teamId,
            userId: user.id,
            role: 'MEMBER'
        }
    });

    revalidatePath('/');
    return { success: true };
}

export async function updateTeamLogo(teamId: string, logoUrl: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Not authenticated" };

    // Ideally verify user is OWNER or ADMIN of the team
    // For MVP, checking membership is enough or skipping permission check if already in settings page

    await prisma.team.update({
        where: { id: teamId },
        data: { logoUrl }
    });

    revalidatePath(`/team/${teamId}/settings`);
    return { success: true };
}

export async function getTeamWithMembers(teamId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    return prisma.team.findUnique({
        where: { id: teamId },
        include: {
            members: {
                include: {
                    user: true
                }
            }
        }
    });
}

/* --- PROJECT ACTIONS --- */

export async function createProject(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Not authenticated" };

    const name = formData.get('name') as string;
    const teamId = formData.get('teamId') as string;

    if (!name || !teamId) return { error: "Missing fields" };

    const project = await prisma.project.create({
        data: {
            name,
            teamId
        }
    });

    revalidatePath('/');
    return { success: true, project };
}

export async function getProject(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    return prisma.project.findUnique({
        where: { id: projectId },
        include: {
            quotes: true,
            team: true
        }
    });
}

/* --- QUOTE ACTIONS --- */

export async function createQuote(projectId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Not authenticated" };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string; // JSON string
    const amount = parseFloat(formData.get('amount') as string) || 0;
    const recipientEmail = formData.get('recipientEmail') as string;
    const status = formData.get('status') as string || "DRAFT";
    const type = formData.get('type') as string || "PURCHASE";

    if (!title || !content) return { error: "Missing fields" };

    await prisma.quote.create({
        data: {
            title,
            content,
            amount,
            projectId,
            status,
            type,
            recipientEmail: recipientEmail || undefined,
            sentAt: status === 'SENT' ? new Date() : undefined
        }
    });

    revalidatePath(`/project/${projectId}`);
    return { success: true };
}

export async function updateQuoteStatus(quoteId: string, status: string) {
    await prisma.quote.update({
        where: { id: quoteId },
        data: {
            status,
            sentAt: status === 'SENT' ? new Date() : undefined
        }
    });
    revalidatePath('/');
    return { success: true };
}

export async function updateQuote(quoteId: string, projectId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return { error: "Not authenticated" };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const amount = parseFloat(formData.get('amount') as string) || 0;
    const status = formData.get('status') as string || 'DRAFT';
    const type = formData.get('type') as string || 'RENTAL';
    const recipientName = formData.get('recipientName') as string || '';
    const recipientEmail = formData.get('recipientEmail') as string || '';

    await prisma.quote.update({
        where: { id: quoteId },
        data: {
            title,
            content,
            amount,
            status,
            type,
            recipientName, // Ensure these fields exist in schema or remove if not
            recipientEmail, // Ensure these fields exist in schema or remove if not
            updatedAt: new Date()
        }
    });

    revalidatePath(`/project/${projectId}`);
    return { success: true };
}

export async function getPublicQuote(quoteId: string) {
    // No session check for public viewing
    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: {
            project: {
                include: {
                    team: {
                        include: {
                            owner: true
                        }
                    }
                }
            }
        }
    });
    return quote as any; // Temporary cast to avoid type errors due to stale Prisma Client
}

export async function getAllQuotes() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return [];

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            teams: {
                include: {
                    projects: {
                        include: {
                            quotes: {
                                orderBy: { updatedAt: 'desc' }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!user) return [];

    // Flatten the structure: User -> Teams -> Projects -> Quotes
    const allQuotes = user.teams.flatMap(team =>
        team.projects.flatMap(project =>
            project.quotes.map(quote => ({
                ...quote,
                projectName: project.name,
                teamName: team.name
            }))
        )
    );

    return allQuotes;
}

/* --- PRODUCT ACTIONS --- */

export async function createProduct(teamId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Not authenticated" };

    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string) || 0;
    const specs = formData.get('specs') as string; // JSON string
    const imageUrl = formData.get('imageUrl') as string;

    if (!name) return { error: "Name is required" };

    await prisma.product.create({
        data: {
            teamId,
            name,
            price,
            specs, // We store it as string, schema expects string? (JSON)
            imageUrl
        }
    });

    revalidatePath(`/team/${teamId}`); // or wherever products are listed
    return { success: true, message: "Product saved to library" };
}

export async function getTeamProducts(teamId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];

    return prisma.product.findMany({
        where: { teamId },
        orderBy: { createdAt: 'desc' }
    });
}

export async function deleteProduct(productId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Not authenticated" };

    await prisma.product.delete({
        where: { id: productId }
    });

    revalidatePath('/');
    return { success: true };
}
