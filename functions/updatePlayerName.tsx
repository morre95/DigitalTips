import {setPlayerName} from "@/functions/common";
import {postJsonWithToken} from "@/functions/api/Post";
import {getPlayerId} from "@/functions/common";

interface IResult {
    error: boolean;
    message?: string;
}
async function updatePlayerName(playerName: string, token: string) : Promise<boolean> {
    const url = `api/change/player/name`;
    const userId = await getPlayerId();
    const result = await postJsonWithToken<{userId: number, playerName: string}, IResult>(url, {userId, playerName}, token);

    if (!result.error) {
        await setPlayerName(playerName)
        return true
    }
    return false
}

export default updatePlayerName;