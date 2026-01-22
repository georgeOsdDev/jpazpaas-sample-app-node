# Agent.md（GitHub Copilot 向け指示書）

このリポジトリは App Service / Azure Container Apps にデプロイして各種 API の挙動や監視を検証するための Node.js + TypeScript サンプルです。Copilot が設計・実装・テスト・PR 作成・レビューを行う際の行動規範をまとめます（会話は日本語、コードコメントは英語）。

---

## 0. 重要ポリシー
- **会話**: Chat は日本語で回答。コード内コメント・ドキュメント内のサンプルコメントは英語。
- **計画必須**: 実装前に「Plan」を提示し、タスク、ファイル、影響範囲、テスト方針を明記してから着手する。
- **OpenAPI 必須**: 全ての API エンドポイントに OpenAPI 定義（`@hono/zod-openapi` の `createRoute` を利用）を付与し、パラメータ・レスポンス・例・タグを定義する。
- **最新ライブラリ維持**: 依存パッケージは基本最新版を採用（LTS Node に整合）。`npm outdated` で確認し、互換性をチェックした上で `npm install <pkg>@latest` を行う。破壊的変更がある場合は計画にリスクを明記。
- **品質**: バリデーションに zod を使用し、HTTP ステータス/エラー形を明示。型安全を優先し、`any` を避ける。

## 1. 作業フロー（Copilot）
1) **理解**: 要求を要約し、対象 API / ファイル / 期待結果 / 非機能（性能・セキュリティ）を整理。
2) **Plan 提示**: 着手前に Plan を提示（例を後述）。不明点があれば質問。
3) **実装**: 合意済み Plan に沿って最小差分で実装。コードコメントは英語。必要に応じて TODO を明記。
4) **テスト**: 可能な限りユニットまたはエンドポイントテストを追加・更新（`npm test` もしくは `npm run <script>` を想定）。テストが無い場合はスモーク手順を書き残す。
5) **自己レビュー**: フォーマット・lint（必要なら `npm run lint`）・型チェック・OpenAPI 記述の整合を確認。
6) **PR 準備**: 変更概要・テスト結果・リスク・デプロイ影響を簡潔にまとめる。差分が大きい場合は Plan と整合しているか再確認。

## 2. コーディング規約
- **言語/構成**: Node.js + TypeScript。`src/routes` 下に Hono ベースのエンドポイントがある。
- **コメント**: コード中のコメントは英語。日本語コメントは禁止。
- **スタイル**: 既存スタイルに合わせる（セミコロン無し、ESM/TS）。不要な `any` を避け、`zod` で入出力スキーマを定義。
- **ログ**: デバッグログは最小限。恒常的なログはレベル（info/warn/error）を意識。
- **エラー**: HTTP エラー時はステータスコードと原因を JSON で返す（例: `{ error: 'message' }`）。

## 3. API 追加時のチェックリスト
- [ ] ルートファイルを `src/routes/<feature>.ts` に追加 or 既存ファイルを拡張。
- [ ] `createRoute` で `tags` / `method` / `path` / `request`（params, query, json, headers）/ `responses` を定義。
- [ ] `responses` には少なくとも 200 / 4xx を記述し、`schema` と `example` を付与。
- [ ] バリデーションは zod で行い、`openapi()` メタを付ける。
- [ ] ビジネスロジックは小さな関数に分離し、テスト可能にする。
- [ ] 追加・変更したエンドポイントを `src/routes/index.ts` でエクスポート。
- [ ] 必要なら `.env.example` や README に設定を追記。

### OpenAPI 記述例（英語コメントのみ）
```ts
// src/routes/example.ts
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

const app = new OpenAPIHono();

const exampleResponse = z.object({
  message: z.string().openapi({ example: 'pong' }),
  timestamp: z.string().datetime().openapi({ description: 'ISO 8601 time' }),
});

app.openapi(
  createRoute({
    tags: ['example'],
    method: 'get',
    path: '/ping',
    responses: {
      200: {
        description: 'Ping response',
        content: { 'application/json': { schema: exampleResponse } },
      },
      400: {
        description: 'Bad request',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
    },
  }),
  (c) => c.json({ message: 'pong', timestamp: new Date().toISOString() })
);

export default app;
```

## 4. 依存関係・バージョン方針
- Node.js は LTS（例: 18+）を前提。`package.json` の engines があれば従う。
- 依存は基本最新版。`npm outdated` で確認し、破壊的変更がある場合は Plan でリスクを明記し代替案を提示。
- 型定義パッケージ（@types/*）も合わせて更新。
- ロックファイル（package-lock.json）を更新し、差分をコミット対象に含める。

## 5. テスト・品質保証
- 可能であれば新規/更新エンドポイントに対してテストを追加（例: supertest など）。
- テストが無い場合は手動確認手順を記録（リクエスト例・期待レスポンス）。
- 型チェック/ビルドがある場合は実行し、結果を PR に記載。

## 6. セキュリティ・設定
- シークレットは `.env`（未コミット）やデプロイ側の環境変数で管理。平文でソースに含めない。
- PII/機密データを扱う場合はマスクまたは収集しない方針を明記。
- 不要なポートやデバッグエンドポイントを本番ビルドに含めない。

## 7. デプロイ考慮（App Service / ACA）
- コンテナイメージは既存の `Dockerfile` を使用。ヘルスチェックのエンドポイントを維持/更新。
- 新規設定が必要な場合、環境変数名を README または `.env.example` に追記。
- スタートアップコマンドやポートは既存設定に合わせる。

## 8. Copilot 用 Plan テンプレート（例）
```
目的: <機能/課題の要約>
変更内容: <追加/修正するエンドポイントやファイル>
影響範囲: <依存する設定や他エンドポイント>
テスト: <予定する自動/手動テスト>
リスク・留意点: <破壊的変更、互換性、性能など>
```

## 9. PR / レビュー テンプレート（例）
- 変更概要: 追加/修正点を箇条書き。
- テスト: 実行したコマンドや結果（例: `npm test`, 手動リクエスト結果）。
- リスク: 破壊的変更やデプロイ手順の有無。
- スクリーンショット/ログ: 必要に応じて添付。

## 10. 追加で相談・確認したい事項（任意）
- API ごとのパフォーマンス要件（時間・メモリ）
- 監視/アラート連携（App Insights 等）
- CI/CD での自動テストやコンテナビルドの有無

---

このファイルは Copilot がタスクを進める際の共通ルールです。Plan を提示し、OpenAPI と最新依存を守りつつ、英語コメントで実装してください。必要に応じてセクションを拡張して運用に合わせてください。
