import { Router } from "express";
import { getManiFest, listObjects, translateObject, uploadObject, urnify } from "../services/aps.mjs";
import formidable from 'express-formidable'

const modelRouter = Router();

modelRouter.route('/').get(async (req, res) => {

    try {
        const objects = await listObjects();
        if (objects) {
            res.json(objects?.map(o => ({
                name: o.objectKey,
                urn: urnify(o.objectId)
            })));
        }

    } catch (error) {
        throw error

    }
}).post(formidable({ maxFileSize: Infinity }), async (req, res, next) => {
    const file = req.files['model-file'];
    if (!file) {
        res.status(400).send('The required field ("model-file") is missing.');
        return;
    }
    try {
        const obj = await uploadObject(file.name, file.path);
        await translateObject(urnify(obj.objectId), req.fields['model-zip-entrypoint']);
        res.json({
            name: obj.objectKey,
            urn: urnify(obj.objectId)
        });
    } catch (err) {
        next(err);
    }
})


modelRouter.route('/:urn/status').get(async (req, res, next) => {

    try {

        const manifest = await getManiFest(req.params.urn);

        if (manifest) {
            let messages = [];
            if (manifest.derivatives) {
                for (const derivative of manifest.derivatives) {
                    messages = messages.concat(derivative.messages || []);
                    if (derivative.children) {
                        for (const child of derivative.children) {
                            messages.concat(child.messages || []);
                        }
                    }
                }
            }
            res.json({ status: manifest.status, progress: manifest.progress, messages });
        }
        else {
            res.json({ status: "N/A" })
        }

    } catch (error) {
        next(error)

    }
});


export default modelRouter;