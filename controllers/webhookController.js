//Controller for webhook for automate github push
const crypto = require('crypto');
const exec = require('child_process').exec;
const SECRET = 'OLTENIAETERNATERRANOVA';
const REPO_DIR = '/home2/fdjfpbet/app.andreeaghelmegeanu.com';

const handleWebhook = (req, res) => {
    const sig = `sha256=${crypto.createHmac('sha256', SECRET).update(JSON.stringify(req.body)).digest('hex')}`;

    if (req.headers['x-hub-signature-256'] === sig) {
        exec(`cd ${REPO_DIR} && git pull`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).send('Server Error');
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            res.status(200).send('Deployed');
        });
    } else {
        return res.status(401).send('Unauthorized');
    }
};

module.exports = { handleWebhook };