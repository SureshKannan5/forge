import APS from "forge-apis"
import { getInternalToken } from "./app.mjs";
import { APS_BUCKET } from "../config.mjs";
import fs from 'fs'

const { BucketsApi, ObjectsApi, DerivativesApi } = APS;




const ensureBucketExists =  async (bucketKey) => {
    try {
        await new BucketsApi().getBucketDetails(bucketKey, null, await getInternalToken());
    } catch (err) {
        if (err.response.status === 404) {
            await new BucketsApi().createBucket({ bucketKey, policyKey: 'persistent' }, {}, null, await getInternalToken());
        } else {
            throw err;
        }
    }
};


const listObjects = async () => {
    await ensureBucketExists(APS_BUCKET);
    let resp = await new ObjectsApi().getObjects(APS_BUCKET, { limit: 64 }, null, await getInternalToken());
    let objects = resp.body.items;
    while (resp.body.next) {
        const startAt = new URL(resp.body.next).searchParams.get('startAt');
        resp = await new ObjectsApi().getObjects(APS_BUCKET, { limit: 64, startAt }, null, await getInternalToken());
        objects = objects.concat(resp.body.items);
    }
    return objects;
};

const uploadObject = async (objectName, filePath) => {
    await ensureBucketExists(APS_BUCKET);
    const buffer = await fs.promises.readFile(filePath);
    const results = await new ObjectsApi().uploadResources(
        APS_BUCKET,
        [{ objectKey: objectName, data: buffer }],
        { useAcceleration: false, minutesExpiration: 15 },
        null,
        await getInternalToken()
    );
    if (results[0].error) {
        throw results[0].completed;
    } else {
        return results[0].completed;
    }
};



// model derivatives;

const translateObject = async (urn, rootFilename) => {
    const job = {
        input: { urn },
        output: { formats: [{ type: 'svf', views: ['2d', '3d'] }] }
    };
    if (rootFilename) {
        job.input.compressedUrn = true;
        job.input.rootFilename = rootFilename;
    }
    const resp = await new DerivativesApi().translate(job, {}, null, await getInternalToken());
    return resp.body;
};

const getManiFest = async (urn) => {
    try {
        const resp = await  new DerivativesApi().getManifest(urn, {}, null, await getInternalToken());
        return resp.body;
    } catch (err) {
        if (err.response.status === 404) {
            return null;
        } else {
            throw err;
        }
    }
};

const urnify = (id) => Buffer.from(id).toString('base64').replace(/=/g, '');




export { listObjects, uploadObject, translateObject, urnify, getManiFest }