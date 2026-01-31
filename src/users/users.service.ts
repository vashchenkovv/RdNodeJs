import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
    private users: User[] = [];

    findOntByID(id: string): User | undefined {
        return this.users.find((user) => user.id === id);
    }

    findOntByEmail(email: string): User | undefined {
        return this.users.find((user) => user.email === email);
    }

    getAll(): User[] {
        return this.users;
    }

    addUser(user: Pick<User, "name" | "email">): User {
        const newUse: User =  {
            ...user,
            id: uuidv4()
        };
        this.users.push(newUse);
        return newUse;
    }

    updateUser(id: string, user: Pick<User, "name" | "email">): User | null {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return null;
        this.users[userIndex] = {...this.users[userIndex], ...user};
        return this.users[userIndex];
    }

    deleteUser(id: string): void {
        this.users = this.users.filter(user => user.id !== id);
    }
}
