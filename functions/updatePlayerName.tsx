import {setPlayerName} from "@/functions/common";
import postJson from "@/hooks/api/Post";
import {getPlayerId} from "@/functions/common";

interface IResult {
    error: boolean;
    message?: string;
}
async function updatePlayerName(playerName: string) : Promise<boolean> {
    const url = `change/player/name`;
    const userId = await getPlayerId();
    const result = await postJson<{userId: number, playerName: string}, IResult>(url, {userId, playerName})
    if (!result.error) {
        await setPlayerName(playerName)
        return true
    }
    return false
}

export default updatePlayerName;