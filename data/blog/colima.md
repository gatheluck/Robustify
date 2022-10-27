---
title: 'macOS の Docker 環境の構築を colima で行う'
date: '2022-09-05'
tags: ['docker']
draft: true
summary: macOS で Docker Desktop が使えない場合は colima を使った Docker 環境の構築が便利.
---

## TL;DR

- Python を用いた研究プロジェクト向けの GitHub リポジトリテンプレート [Ascender](https://github.com/cvpaperchallenge/Ascender) を公開.
- チームでの研究・開発が想定されるプロジェクトにおいて有用な機能を中心に実装.

<br />
<TOCInline toc={props.toc} exclude="TL;DR" asDisclosure />

## Background

[2022 年 3 月 31 日から Docker Desktop が有料化](https://www.docker.com/blog/updating-product-subscriptions/)されました
(ただし, 従業員数が 250 人未満, 年間収益が 1,000 万ドル未満の企業, 個人利用, 教育, 非営利目的の OSS では引き続き無料で利用可能).

これをうけて,

## What is colima?

colima (Containers in Lima) は名前から示唆されるように Lima の派生プロジェクトで, macOS において Docker・Kuberbetes 環境を最小限のセットアップで構築することを目指しているプロジェクトです.

Linux VM 内で `dockerd` を起動し, VM からホストにマウントされた `docker.socket` ファイルを経由して, ホストが `dockerd` にアクセス出来るようにしています.

colima は起動時に `docker context` を使って colima 用のコンテキストを作成し, そのコンテキストを使うようにしてくれます.

## Install

Homebrew, MacPorts, Nix のいずれにも対応しています. Homebrew では以下でインストール出来ます.

```shell
% brew install colima
```

Ascender では開発環境による影響を極力小さくするために, Docker コンテナ内で開発をすることを推奨しています. そのため, Ascender で開発を始める準備として [Docker](https://www.docker.com/), [Docker Compose](https://github.com/docker/compose), [NVIDIA Container Toolkit (nvidia-docker2)](https://github.com/NVIDIA/nvidia-docker) をインストールします. 非推奨ですが [Docker を使用しなくても Ascender で開発を行うことは可能です](https://github.com/cvpaperchallenge/Ascender#use-ascender-without-docker).そのため, 既にインストール済みの方や Docker を使用しない方は, 読み飛ばして下さい.

下記のインストールのコマンドは Ubuntu を想定したものです, 異なる OS で開発をする場合は, それぞれの公式ドキュメントを参考にして適宜インストールして下さい.

Docker と Docker Compose をインストールします.

```shell
% sudo apt update
% sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

`sudo docker run --rm hello-world` を実行して "Hello from Docker!" から始まるメッセージが表示されれば Docker をインストール出来ています.

GPU を使用して開発をする場合は NVIDIA Container Toolkit もインストールします.

```shell
% distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
      && curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
      && curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
            sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
            sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

% sudo apt update
% sudo apt install -y nvidia-docker2
% sudo systemctl restart docker
```

`sudo docker run --rm --gpus all nvidia/cuda:11.0.3-base nvidia-smi` を実行して `nvidia-smi` の実行結果が表示されれば NVIDIA Container Toolkit をインストール出来ています.

## Start development

まず, Ascender をテンプレートとして新しい Github リポジトリを作成し, ローカルにクローンします. [こちらのリンク](https://github.com/cvpaperchallenge/Ascender/generate)からリポジトリの作成ページに遷移できます.

```shell
% git clone git@github.com:<YOUR_USER_NAME>/<YOUR_REPO_NAME>.git
% cd <YOUR_REPO_NAME>
```

Docker イメージをビルドし, コンテナを起動します. GPU 環境を使用する場合は [environments/gpu](https://github.com/cvpaperchallenge/Ascender/blob/develop/environments/gpu/docker-compose.yaml), CPU のみの環境の場合は [environments/cpu](https://github.com/cvpaperchallenge/Ascender/blob/develop/environments/cpu/docker-compose.yaml) の `docker-compose.yaml` を使用して下さい.

```shell
% cd environments/gpu  # CPUのみの環境の場合は`cd environments/cpu`
% sudo docker compose up -d
```

`sudo docker compose exec core bash` でコンテナの中に入り, Poetry を使用して仮想環境を作成, パッケージをインストールします. `poetry install` を実行するのは初回のみで大丈夫です.

```shell
% sudo docker compose exec core bash
$ poetry install
```

これで開発準備完了です. `sudo docker compose up -d` の実行によってコンテナ内の `/home/challenger/ascender` に[ホスト PC のディレクトリがボリュームされている](https://github.com/cvpaperchallenge/Ascender/blob/master/environments/gpu/docker-compose.yaml#L18)ので, ホスト PC でコードを編集するとコンテナ内に反映されます. その逆もまた然りです.

もし, 開発に Docker を使用しない場合は, リポジトリをローカルにクローンした後, Poetry をローカル PC に直接インストールし, `poetry install` を実行して下さい.

```shell
% git clone git@github.com:<YOUR_USER_NAME>/<YOUR_REPO_NAME>.git
% cd <YOUR_REPO_NAME>
% python3 -m pip install poetry  # ローカルPCにPoetryをインストール
% poetry install
```

ただし, 後述の Github Actions の workflow は Dockerfile を用いて動作するため, Dockerfile を使用せずに開発を進めた場合, PR の作成時等に workflow がエラーを挙げる可能性があります. もし, エラーが出た場合は, Dockerfile を修正するか, workflow を削除するなどの対応を行う必要があります.

## During development

Ascender では開発を支援するために Poetry, Black, Flake8, isort, Mypy, pytest を導入しており, Make をタスクランナーとして使用して少数のコマンドで簡単に実行出来るようにしています.

### Poetry

Ascender では Poetry を使用して Python パッケージの管理を行なっています. pip と比較して Poetry は一定の学習コストがかかりますが, Poetry を使用することで, 開発環境の再現性を高めたり, PyPI へパッケージとして公開するときのコストも小さく済みます.
Poetry の使い方についての詳しい説明は[こちらの資料](https://cvpaperchallenge.github.io/Britannica/poetry101/ja)や[公式ドキュメント](https://python-poetry.org/docs/)を参照して下さい.

Poetry では [`poetry add`](https://python-poetry.org/docs/cli/#add) コマンドを使ってパッケージを追加することが出来ます.

```shell
# Poetry を用いてパッケージをインストール
$ poetry add <PACKAGE_NAME>
```

`poetry add` を実行した際に良く挙がるエラーとして `SolverProblemError` があります. `SolverProblemError` の解決については, 上記の資料の ["Frequently faced error" のページ](https://cvpaperchallenge.github.io/Britannica/poetry101/ja/#/16)を参考にしてみて下さい.

Poetry が作成した仮想環境を使用してコマンドを実行するには [`poetry run`](https://python-poetry.org/docs/cli/#run) コマンドを使用します. Poetry でパッケージをインストールしたのに, それが見つからないと怒られるときは `poetry run` をつけ忘れているかもしれません.

```shell
# Poetry が作成した仮想環境を使用して hoge.py を実行
$ poetry run python hoge.py
```

また, Deep Learning を使用するプロジェクトで Poetry を使用すると起こる問題として, PyTorch と Poetry(v1.1 系)の相性が良くないというものがありますが, Ascender では[ベータ版の Poetry1.2 系を使用することで PyTorch との相性問題に対処しています](https://github.com/cvpaperchallenge/Ascender#compatibility-issue-between-pytorch-and-poetry). 具体的な `pyproject.toml` の設定については Ascender を使用している[こちらのプロジェクト](https://github.com/ueda0319/neddf/blob/master/pyproject.toml#L31-L34)を参考にしてみて下さい.

### Black, Flake8, isort

Ascender ではコードスタイルを統一するために Black, Flake8, isort を使用しています. [Makefile](https://github.com/cvpaperchallenge/Ascender/blob/master/Makefile) に定義されているコマンド（`make format` と `make lint`）を使用することでこれらのツールを一度に適用出来るようになっています. コマンド名は PFN の [pysen](https://github.com/pfnet/pysen) を参考にしています.

```shell
# Black と isort を使用してコードのスタイルをフォーマット
$ make format
# Black, Flake8, isort, mypy を使用してコードのスタイルと静的な型を確認 (コードの変更は行わない)
$ make lint
```

スタイルの設定を調整したい場合は, Black と isort については [`pyproject.toml`](https://github.com/cvpaperchallenge/Ascender/blob/master/pyproject.toml) に Flake8 については [`.flake8`](https://github.com/cvpaperchallenge/Ascender/blob/master/.flake8) にそれぞれ設定が記載されていますので, 必要に応じて適宜編集して下さい. 各ツールで設定可能な項目はそれぞれ下記のリンク先を参照して下さい.

- [Black の設定項目](https://black.readthedocs.io/en/stable/usage_and_configuration/the_basics.html#configuration-via-a-file)
- [Flake8 の設定項目](https://flake8.pycqa.org/en/latest/user/configuration.html)
- [isort の設定項目](https://pycqa.github.io/isort/docs/configuration/options.html)

### Mypy

Ascender ではコードの可読性と信頼性の向上のために型アノテーションを可能な限り使用することを推奨し, Mypy による静的型チェックを導入しています.
Python の型アノテーションの付け方について確認をしたい方は [Mypy のチートシート](https://mypy.readthedocs.io/en/stable/cheat_sheet_py3.html)や [Python ドキュメントの typing パッケージのページ](https://docs.python.org/3/library/typing.html)を参照して下さい. Mypy による静的型チェックは既に紹介済のコマンドである `make lint` によって他のツールによるチェックと合わせて実行が出来るようになっています.

```shell
# Black, Flake8, isort, mypy を使用してコードのスタイルと静的な型を確認 (コードの変更は行わない)
$ make lint
```

Mypy の設定については [`pyproject.toml`](https://github.com/cvpaperchallenge/Ascender/blob/master/pyproject.toml) に記載されています. 設定が可能な項目については [Mypy の公式ドキュメント](https://mypy.readthedocs.io/en/stable/config_file.html)を参照して下さい.

### pytest

Ascender ではテストのためのツールとして [pytest](https://github.com/pytest-dev/pytest) を導入しています. pytest の使い方について知りたいと方は[公式ドキュメント](https://docs.pytest.org)や [M3 Tech Blog の小本さんの記事](https://www.m3tech.blog/entry/pytest-summary)を参考にしてみて下さい.

研究プロジェクトで開発速度を犠牲にしてまでテストを書く必要が本当にあるのか？という論点は当然あると思います. 例えば, テストのカバレッジを上げるといったことを目的としてしまうと本末転倒になりかねません. しかし, 手法の中心となる重要な関数・クラスについてテストを書くことは致命的なバグを発見を容易にしたり, 他のチームメンバーが関数・クラスを使用する際の理解を助けたりと, 一定のリソースを割くに値する利点があると考えています.

`make test` コマンドを実行することで [`tests` ディレクトリ](https://github.com/cvpaperchallenge/Ascender/tree/d35ba431d7dd2816f7a32ed43ceaa7e00afa2f83/tests)下に配置されたテストを実行することが出来ます. また, `make test-all` コマンドを使用すると, これまで紹介してきた, Black, Flake8, isort, Mypy, pytest を用いたチェックを一度に行うことが出来ます.

```shell
# pytest によるテストを実行
$ make test
# Black, Flake8, isort, Mypy, pytest によるチェックを一度に実行
$ make test-all
```

## Create pull request

Ascender では機能の開発は専用のブランチで行い, 適宜 pull request を作成してメインブランチに機能を取り込んでいく方法を推奨しています.
GitHub を使用した開発や機能について知りたい場合は GitHub 公式の [GitHub Skills](https://skills.github.com/) を参照して下さい.

デフォルトの [pull request のテンプレート](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)が [`.github/PULL_REQUEST_TEMPLATE.md`](https://github.com/cvpaperchallenge/Ascender/blob/master/.github/PULL_REQUEST_TEMPLATE.md) に定義されていますので, 必要に応じて適宜編集して下さい. また, pull request 時にはスタイル・静的型チェックとテストコードを実行する [workflow](https://docs.github.com/en/actions/using-workflows/about-workflows) が走るようになっています.
こちらは [`.github/workflows/lint-and-test.yaml`](https://github.com/cvpaperchallenge/Ascender/blob/master/.github/workflows/lint-and-test.yaml) に定義されており, デフォルトで Python 3.8 と 3.9 について走るようになっています.

## Stop development

開発が終了したら必要に応じてコンテナを停止して下さい.

```bash
% cd environments/gpu  # CPU のみの環境の場合は `cd environments/cpu`
% sudo dokcer compose stop
```

コンテナを削除したい場合は代わりに `sudo dokcer compose down` を使用して下さい.

## Summary

Python を用いた研究プロジェクト向けの GitHub リポジトリテンプレートとして開発した Ascender について紹介をしました. Ascender の開発・保守は今後も継続的に行っていく予定ですので, 追加機能の要望や質問等につきましては GitHub の issue で受け付けています. 質問についてはいくつか [FAQ](https://github.com/cvpaperchallenge/Ascender#faq) として README にまとめてありますので, そちらも参照して下さい.
