# uouo

## 概要
- https://qiita.com/hidehiro98/items/841ece65d896aeaa8a2a の内容をTSで実装したもの
  - 記事の翻訳元は https://hackernoon.com/learn-blockchains-by-building-one-117428612f46
- ローカルで複数サーバーを起動してブロックチェーンの動きを見る用
- オリジナルは続編制作中（制作中とは言っていない）のため、advancedブランチで以下の機能を追加した
  - サーバー起動時に他サーバーのノードプールに自身を追加する仕組み
  - トランザクション登録時にトランザクションプールを同期する仕組み
  - マイニング成功時にプール内のブロックチェーンのコンフリクトを自動解消する仕組み

## ためしかた
- `PORT=(port番号、デフォルトで3210) npm run start:dev` でサーバー起動
- `（サーバー）/` でブロックチェーンの全情報
  - `nodes` に起動した分のサーバーが列挙されていない場合は、列挙されていないサーバーで `(サーバーURL)/initialize`
- `(各環境変数=各環境変数) npx ts-node bot/sendTransaction.ts` でトランザクション送信
- `（サーバーURL）/mine` でマイニング
  - `bot/minebot.ts` でマイニングの定時実行