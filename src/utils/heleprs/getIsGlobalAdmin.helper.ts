import {Role, User} from "@prisma/client";

export const getIsGlobalAdmin = (user?: User) => user?.role === Role.globalAdmin;
