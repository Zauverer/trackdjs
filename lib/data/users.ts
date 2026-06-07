import { users } from "@/lib/data";

export function getUsers() {
  return users;
}

export function getUserById(id: string) {
  return users.find((user) => user.id === id);
}
