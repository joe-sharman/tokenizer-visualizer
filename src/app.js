import {AutoTokenizer} from '@huggingface/transformers';
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));


function cleanTokensBPE(tokens) {
    return tokens.map((token, index) => {
        if (token.startsWith("Ġ")) {
            return " " + token.slice(1);
        } else if ([".", ",", "!", "?", ";", ":", "'"].includes(token)) {
            return token;
        } else if (index === 0) {
            return token;
        } else if (tokens[index - 1].endsWith("'")) {
            return token;
        } else {
            return token;
        }
    })
}

function cleanTokensSentencePiece(tokens) {
    return tokens.map((token, index) => {
        if (token.startsWith("▁") && index !== 0) {
            return " " + token.slice(1);
        } else if (token.startsWith("▁") && index === 0) {
            return token.slice(1);
        } else if ([".", ",", "!", "?", ";", ":", "'"].includes(token)) {
            return token;
        } else if (tokens[index - 1].endsWith("'")) {
            return token;
        } else {
            return token;
        }
    })
}

function cleanTokensBert(tokens) {
    return tokens.map((token, index) => {
        if (token.startsWith("##")) {
            return token.replace("##", "");
        } else if ([".", ",", "!", "?", ";", ":", "'"].includes(token)) {
            return token;
        } else if (index === 0) {
            return token;
        } else if (tokens[index - 1].endsWith("'")) {
            return token;
        } else {
            return " " + token;
        }
    })
}

function cleanTokens(tokens) {
    if (tokens.some(token => token.startsWith("Ġ"))) {
        return cleanTokensBPE(tokens);
    } else if (tokens.some(token => token.startsWith("▁"))) {
        return cleanTokensSentencePiece(tokens);
    } else if (tokens.some(token => token.startsWith("##"))) {
        return cleanTokensBert(tokens)
    } else {
        // Default to BPE-style tokenization, in-case no special markers are found
        return cleanTokensBPE(tokens);
    }
    ;
}

// The tokenizer name is provided by client, so we cache tokenizers to avoid reloading on every request.
const tokenizerCache = new Map();

async function tokenizerFromName(name) {
    if (tokenizerCache.has(name)) {
        return tokenizerCache.get(name);
    } else {
        tokenizerCache[name] = await AutoTokenizer.from_pretrained(name);
        return tokenizerCache[name];
    }
}

app.post("/api/tokenize", async (req, res) => {
    let {tokenizerName, text} = req.body;
    let tokenizer = await tokenizerFromName(tokenizerName);
    console.log(`For ${tokenizerName} received text: ${text}`);
    let tokens = tokenizer.tokenize(text);
    console.log(`For ${tokenizerName} received uncleaned tokens: ${tokens}`);
    console.log(tokens)
    let cleanedTokens = cleanTokens(tokens);
    console.log(`For ${tokenizerName} received cleaned tokens: ${cleanedTokens}`);
    res.send(cleanedTokens);
});

export default app;
