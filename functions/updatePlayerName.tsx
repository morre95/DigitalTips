import BaseUrl from "@/hooks/api/BaseUrl";
import postJson from "@/hooks/api/Post";

interface IResult {
    error: boolean;
    message?: string;
}
async function updatePlayerName(userId: number, playerName: string) : Promise<boolean> {
    const url = `change/player/name`;
    const result = await postJson<{userId: number, playerName: string}, IResult>(url, {userId, playerName})
    return result.error
}

export default updatePlayerName;