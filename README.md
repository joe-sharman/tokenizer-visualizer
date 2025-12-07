# Tokenizer Visualizer

_Tokenizer Visualizer_ is tool to visualise how different language models tokenize text.

Input any model from [Hugging Face](https://huggingface.co/models), along with some sample text.

![](/../main/images/demo.png?raw=true)

Tokenizers use different special characters to denote whether a token continues the previous word, or starts a new one. This project can handle 3 styles of tokenizer:
- `##` used by WordPiece tokenizers such as BERT.
- `Ġ` used by byte level BPE tokenizers such as GPT-2 and RoBERTa.
- `▁` (low underscore) used by SentencePiece tokenizers such as T-5 and LLaMa.

This project was created to practice front-end development.
