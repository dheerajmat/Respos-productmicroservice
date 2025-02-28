import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError, ValidationError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const authenticate = async (username, password) => {
    try {
        if (!username || !password) {
            throw new ValidationError('Username and password are required');
        }

        const user = await prisma.userlogin.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: 'insensitive'
                },
                isdeleted: false
            }
        });

        if (!user) {
            logger.warn('Authentication failed: User not found', { username });
            throw new AppError('Invalid credentials', 401);
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        // Get the effective organization ID
        const effectiveOrgId = user.uoid || user.roleid_orgid;

        // Get the address mapping for the effective organization
        const addressMapping = await prisma.userorgaddressmapping.findFirst({
            where: {
                uoid: effectiveOrgId,
                isdeleted: false
            },
            select: {
                uaid: true
            }
        })

        // Create JWT token
        const token = jwt.sign(
            {
                uid: user.uid.toString(),
                uoid: user?.uoid?.toString(),
                username: user.username,
                roleid: user?.roleid?.toString()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // // Log login attempt
        // await prisma.userLogin.create({
        //     data: {
        //         uid: user.uid,
        //         uoid: user.UserRoleMapping[0]?.uoid,
        //         username: user.fullname,
        //         logintime: new Date(),
        //         roleid: user.UserRoleMapping[0]?.roleid,
        //         fullname: user.fullname,
        //         employee_id: user.employee_id,
        //         profilestatus: user.profilestatus,
        //         accountstatus: user.accountstatus
        //     }
        // });

        // Remove sensitive data before sending response
        // const { password: _, ...userWithoutPassword } = user;

        logger.info('User authenticated successfully', {
            uid: user.uid,
            username,
            effectiveOrgId,
            uaid: addressMapping?.uaid
        });
        return {
            ulid: user.ulid,
            uid: user.uid,
            uoid: user.roleid == 1 ? user.uoid : user.roleid_orgid,
            username: user.username,
            roleid: user.roleid,
            fullname: user.fullname,
            uaid: addressMapping?.uaid || null,
            token
        };
    } catch (error) {
        logger.error('Authentication error', {
            error: error.message,
            stack: error.stack,
            username
        });

        throw error;
    }
};

const updateLoginTime = async (ulid) => {
    try {
        await prisma.userlogin.update({
            where: {
                ulid: ulid
            },
            data: {
                logintime: new Date()
            }
        });
    } catch (error) {
        logger.error('Error updating login time', {
            error: error.message,
            stack: error.stack,
            ulid
        });
        throw error;
    }
}

const updateLogoutTime = async (ulid) => {
    try {
        await prisma.userlogin.update({
            where: {
                ulid: ulid
            },
            data: {
                logouttime: new Date()
            }
        });
    } catch (error) {
        logger.error('Error updating logout time', {
            error: error.message,
            stack: error.stack,
            ulid
        });
    }
}

export { authenticate, updateLoginTime, updateLogoutTime };