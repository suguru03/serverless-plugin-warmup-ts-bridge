# serverless-plugin-warmup-ts-bridge

The library resolves [a warmup and typescript issue](https://github.com/prisma/serverless-plugin-typescript/issues/125).

## Install

```sh
$ npm install -D serverless-plugin-warmup-ts-bridge
// or
$ yarn add -D serverless-plugin-warmup-ts-bridge
```


```yaml
// serverless.yaml
plugins:
  - serverless-plugin-warmup-ts-bridge
  - serverless-plugin-warmup
  - serverless-plugin-typescript
```
