import APS from "forge-apis"
import { APS_CLIENT_ID, APS_CLIENT_SECRET } from "../config.mjs"

const { AuthClientTwoLegged } = APS;


let internalAuthClient = new AuthClientTwoLegged(APS_CLIENT_ID, APS_CLIENT_SECRET, ['bucket:read', 'bucket:create', 'data:read', 'data:write', 'data:create'], true);

let publicAuthClient = new AuthClientTwoLegged(APS_CLIENT_ID, APS_CLIENT_SECRET, ['viewables:read'], true);

// generate tokens for internal use ==> access to read/write access to data management buckets
const getInternalToken = async () => {
    if (!internalAuthClient.isAuthorized()) {
        await internalAuthClient.authenticate();
    }

    return internalAuthClient.getCredentials();
}

// generate toke for public use
const getPublicToken = async () => {

    if (!publicAuthClient.isAuthorized()) {

        await publicAuthClient.authenticate();

    }
    return publicAuthClient.getCredentials();
}



export { getInternalToken, getPublicToken };