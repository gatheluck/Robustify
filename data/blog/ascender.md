---
title: 'Ascender: Accelerator of Scientific Development and Research'
date: '2022-07-07'
tags: ['python', 'research', 'cvpaper.challenge']
draft: false
summary: Pythonを用いた研究プロジェクトのためのテンプレートAscenderを公開しました.
---

## TL;DR

- Python を用いた研究プロジェクト向けの GitHub リポジトリテンプレート[Ascender](https://github.com/cvpaperchallenge/Ascender)を公開.
- チームでの研究・開発が想定されるプロジェクトにおいて有用な機能を実装.

## Background

私の所属している [cvpaper.challnege](http://xpaperchallenge.org/cv/) ではグループで研究活動を行っているため, グループメンバーがそれぞれの環境で 1 つの研究のための実験コードを開発する機会が頻繁にあります. しかし, これまで共通のテンプレートやコーディング規約が存在していなかったため, コードの共有や再利用, チームでの同時開発は上手く出来ていない状況でした. そこで, [XCCV グループ](http://xpaperchallenge.org/cv/xccv)の 2022 年のメタサーベイ活動の一貫としてプロジェクトテンプレートを作成することにしました. 本記事では作成したプロジェクトテンプレートの機能と使い方について簡単に紹介します.

## What is Ascender

上記のような背景で Python を用いた研究プロジェクト向けの GitHub リポジトリテンプレートである [Ascender](https://github.com/cvpaperchallenge/Ascender) を作成しました. 特徴としては下記のような点があります.

- **コンテナ仮想化**: Docker を使用することで開発環境依存を減らし, コードの移植性を向上.
- **パッケージ管理**: Poetry を使用したパッケージ管理により, 同一環境の再現性を向上.
- **コードスタイル**: Black, Flake8, isort を使用してコードスタイルを自動的に統一.
- **静的型チェック**: Mypy による静的型チェックにより, コードの信頼性を向上.
- **テスト**: pytest を使用したテストコードを簡単に使用可能.
- **GitHub 関連機能**: Pull request 作成時の workflow や issue テンプレート等を実装済.

Python を用いた ML 周りのプロジェクトテンプレートとしては, [Cookiecutter Data Science](https://github.com/drivendata/cookiecutter-data-science) や [Lightning-Hydra-Template](https://github.com/ashleve/lightning-hydra-template) など既に広く使われているものもあるかと思いますが, 今回は特にチームでの同時開発を主軸とし, 開発の際に特定のライブラリの制約を出来るだけ受けないようにしました.

## Prerequisites

Ascender では開発環境による影響を極力小さくするために, Docker コンテナ内で開発をすることを推奨しています. そのため, Ascender で開発を始める準備として [Docker](), [Docker Compose](), [NVIDIA Container Toolkit (nvidia-docker2)]() をインストールします. 非推奨ですが Docker を使用しなくても Ascender で開発を行うことは可能です.そのため, 既にインストール済みの方や Docker を使用しない方は, この章は

```shell
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

## Start development

まず, Ascender をテンプレートとして新しい Github リポジトリを作成し, ローカルにクローンします. [こちらのリンク](https://github.com/cvpaperchallenge/Ascender/generate)からリポジトリの作成ページに遷移できます.

```shell
% git clone git@github.com:<YOUR_USER_NAME>/<YOUR_REPO_NAME>.git
% cd <YOUR_REPO_NAME>
```

Docker イメージをビルドし, コンテナを起動します. GPU 環境を使用する場合は [environments/gpu](https://github.com/cvpaperchallenge/Ascender/blob/develop/environments/gpu/docker-compose.yaml), CPU のみの環境の場合は [environments/cpu](https://github.com/cvpaperchallenge/Ascender/blob/develop/environments/cpu/docker-compose.yaml) の `docker-compose.yaml` を使用して下さい.

```shell
% cd environments/gpu  # CPU のみの環境の場合は `cd environments/cpu`
% sudo docker compose up -d
```

`sudo docker compose exec core bash` でコンテナの中に入り, Poetry を使用して仮想環境を作成, ライブラリをインストールします. `poetry install` を実行するのは初回のみで大丈夫です.

```shell
% sudo docker compose exec core bash
$ poetry install
```

これで開発準備完了です. `sudo docker compose up -d` によってコンテナ内の `/home/challenger/ascender` に[ホスト PC のディレクトリがボリュームされている](https://github.com/cvpaperchallenge/Ascender/blob/master/environments/gpu/docker-compose.yaml#L18)ので, ホスト PC でコードを編集するとコンテナ内に反映されます. 逆もまた然りです.

## During development

### Poetry

Ascender では Poetry を使用してパッケージの管理を行なっています.
Poetry を使用したことがない方は[こちらの資料](https://cvpaperchallenge.github.io/Britannica/poetry101/ja)や[公式ドキュメント](https://python-poetry.org/docs/)を合わせて参照して下さい.

```shell
# Poetry を用いてライブラリをインストール
$ poetry add <LIBARY_NAME>
# Poetry が作成した仮想環境を使用して python3 のインタラクティブシェルを起動
$ poetry run python3
```

### Black, Flake8, isort

Ascender ではコードスタイルを統一するために Black, Flake8, isort を使用しています. [Makefile](https://github.com/cvpaperchallenge/Ascender/blob/master/Makefile) に定義されているコマンドを使用して一度に適用出来るようになっています.　(コマンド名は [pysen](https://github.com/pfnet/pysen) のものに寄せています.)

```shell
# Black と isort を使用してコードのスタイルをフォーマット
$ make format
# Black, Flake8, isort を使用してコードのスタイルを確認 (コードの変更は行わない)
$ make lint
```

### Mypy

### pytest

## Stop development

開発が終了したら必要に応じてコンテナを停止して下さい.

```bash
% cd environments/gpu  # CPU のみの環境の場合は `cd environments/cpu`
% sudo dokcer compose stop
```

コンテナを削除したい場合は代わりに `sudo dokcer compose down` を使用して下さい.

## Inline Highlighting

Sample of inline highlighting `sum = parseInt(num1) + parseInt(num2)`

## Code Blocks

Some Javascript code

```javascript
var num1, num2, sum
num1 = prompt('Enter first number')
num2 = prompt('Enter second number')
sum = parseInt(num1) + parseInt(num2) // "+" means "add"
alert('Sum = ' + sum) // "+" means combine into a string
```

Some Python code 🐍

```python
def fib():
    a, b = 0, 1
    while True:            # First iteration:
        yield a            # yield 0 to start with and then
        a, b = b, a + b    # a will now be 1, and b will also be 1, (0 + 1)

for index, fibonacci_number in zip(range(10), fib()):
     print('{i:3}: {f:3}'.format(i=index, f=fibonacci_number))
```
