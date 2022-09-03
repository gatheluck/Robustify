---
title: 'Ascender: Accelerator of Scientific Development and Research'
date: '2022-07-07'
tags: ['python', 'research', 'cvpaper.challenge']
draft: false
summary: Pythonを用いた研究プロジェクトのためのテンプレートAscenderを公開しました.
---

## TL;DR

- Python を用いた研究プロジェクト向けの GitHub リポジトリテンプレート [Ascender](https://github.com/cvpaperchallenge/Ascender) を公開.
- チームでの研究・開発が想定されるプロジェクトにおいて有用な機能を中心に実装.

## Background

私の所属している [cvpaper.challnege](http://xpaperchallenge.org/cv/) ではグループで研究活動を行っているため, グループメンバーがそれぞれの環境で 1 つの研究のための実験コードを開発する機会が頻繁にあります. しかし, これまで共通のテンプレートやコーディング規約が存在していなかったため, コードの共有や再利用, チームでの同時開発は上手く出来ていない状況でした. そこで, [XCCV グループ](http://xpaperchallenge.org/cv/xccv) の 2022 年のメタサーベイ活動の一貫としてプロジェクトテンプレートを作成することにしました. 本記事では作成したプロジェクトテンプレートの機能と使い方について簡単に紹介します.

## What is Ascender

上記のような背景で Python を用いた研究プロジェクト向けの GitHub リポジトリテンプレートである [Ascender](https://github.com/cvpaperchallenge/Ascender) を作成しました. 特徴としては下記のような点があります.

- **コンテナ仮想化**: [Docker](https://www.docker.com/) を使用することで開発環境依存を減らし, コードの移植性を向上.
- **パッケージ管理**: [Poetry](https://github.com/python-poetry/poetry) を使用したパッケージ管理により, 同一環境の再現性を向上.
- **コードスタイル**: [Black](https://github.com/psf/black), [Flake8](https://github.com/pycqa/flake8), [isort](https://github.com/PyCQA/isort) を使用してコードスタイルを自動的に統一.
- **静的型チェック**: [Mypy](https://github.com/python/mypy) による静的型チェックにより, コードの信頼性を向上.
- **テスト**: [pytest](https://github.com/pytest-dev/pytest) を使用したテストコードを簡単に使用可能.
- **GitHub 関連機能**: Pull request 作成時の [workflow](https://docs.github.com/en/actions/using-workflows/about-workflows) や [issue テンプレート](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates) 等を実装済.

Python を用いた ML 周りのプロジェクトテンプレートとしては, [Cookiecutter Data Science](https://github.com/drivendata/cookiecutter-data-science) や [Lightning-Hydra-Template](https://github.com/ashleve/lightning-hydra-template) など既に広く使われているものもあるかと思いますが, 今回は特にチームでの同時開発を主軸とし, 開発の際に特定のライブラリの制約を出来るだけ受けないようにしました.

## Prerequisites

Ascender では開発環境による影響を極力小さくするために, Docker コンテナ内で開発をすることを推奨しています. そのため, Ascender で開発を始める準備として [Docker](https://www.docker.com/), [Docker Compose](https://github.com/docker/compose), [NVIDIA Container Toolkit (nvidia-docker2)](https://github.com/NVIDIA/nvidia-docker) をインストールします. 非推奨ですが [Docker を使用しなくても Ascender で開発を行うことは可能です](https://github.com/cvpaperchallenge/Ascender#use-ascender-without-docker).そのため, 既にインストール済みの方や Docker を使用しない方は, 読み飛ばして下さい.

下記のインストールのコマンドは Ubuntu を想定したものです, 異なる OS で開発をする場合は, それぞれの公式ドキュメントを参考にして適宜インストールして下さい.

Docker と Docker Compose をインストールします.

```shell
% sudo apt update
% sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

`sudo docker run --rm hello-world` を実行して "Hello from Docker!" から始まるメッセージが表示されれば Docker をインストール出来ています.

また, GPU を使用して開発をする場合は NVIDIA Container Toolkit もインストールします.

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

これでインストールは完了です. 下記のコマンドを実行して ``

```shell
% sudo docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

## Start development

まず, Ascender をテンプレートとして新しい Github リポジトリを作成し, ローカルにクローンします. [こちらのリンク](https://github.com/cvpaperchallenge/Ascender/generate)からリポジトリの作成ページに遷移できます.

```shell
% git clone git@github.com:<YOUR_USER_NAME>/<YOUR_REPO_NAME>.git
% cd <YOUR_REPO_NAME>
```

Docker イメージをビルドし, コンテナを起動します. GPU 環境を使用する場合は [environments/gpu](https://github.com/cvpaperchallenge/Ascender/blob/develop/environments/gpu/docker-compose.yaml), CPU のみの環境の場合は [environments/cpu](https://github.com/cvpaperchallenge/Ascender/blob/develop/environments/cpu/docker-compose.yaml) の`docker-compose.yaml`を使用して下さい.

```shell
% cd environments/gpu  # CPUのみの環境の場合は`cd environments/cpu`
% sudo docker compose up -d
```

`sudo docker compose exec core bash`でコンテナの中に入り, Poetry を使用して仮想環境を作成, パッケージをインストールします. `poetry install`を実行するのは初回のみで大丈夫です.

```shell
% sudo docker compose exec core bash
$ poetry install
```

これで開発準備完了です. `sudo docker compose up -d`の実行によってコンテナ内の`/home/challenger/ascender`に[ホスト PC のディレクトリがボリュームされている](https://github.com/cvpaperchallenge/Ascender/blob/master/environments/gpu/docker-compose.yaml#L18)ので, ホスト PC でコードを編集するとコンテナ内に反映されます. その逆もまた然りです.

もし, 開発に Docker を使用しない場合は, リポジトリをローカルにクローンした後, Poetry をローカル PC に直接インストールし, `poetry install`を実行して下さい.

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

## References

**Ascender 以外の Python を用いた ML 周りのプロジェクトテンプレート**

1. [Cookiecutter Data Science](https://github.com/drivendata/cookiecutter-data-science)
1. [Lightning-Hydra-Template](https://github.com/ashleve/lightning-hydra-template)
1. []()
