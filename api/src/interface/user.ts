export interface UserData {
activated: boolean;
locked: boolean;
_id: string; // Cambiato il tipo a string per rappresentare l'ID
username: string;
display_name: string;
isAdmin: boolean;
password_hashed: string;
creation_date: string;
__v: number;
last_login: string;
}
