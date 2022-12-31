---
title: 'Colima で macOS の Docker 環境構築'
date: '2022-12-31'
tags: ['docker']
draft: false
summary: macOS で Docker Desktop が使えない場合は Colima を使った Docker 環境の構築が便利.
---

## TL;DR

- macOS で Docker Desktop が使えない場合は Colima を使った Docker 環境の構築が良い感じです.

<br />
<TOCInline toc={props.toc} exclude="TL;DR" asDisclosure />

## Background

[2022 年 3 月 31 日から Docker Desktop が有料化](https://www.docker.com/blog/updating-product-subscriptions/)されました
(ただし, 従業員数が 250 人未満, 年間収益が 1,000 万ドル未満の企業, 個人利用, 教育, 非営利目的の OSS では引き続き無料で利用可能).

これをうけて,

## What is Colima?

Colima (Containers in Lima) は名前から示唆されるように Lima の派生プロジェクトで, macOS において Docker・Kuberbetes 環境を最小限のセットアップで構築することを目指しているプロジェクトです.

Linux VM 内で `dockerd` を起動し, VM からホストにマウントされた `docker.socket` ファイルを経由して, ホストが `dockerd` にアクセス出来るようにしています.

Colima は起動時に `docker context` を使って colima 用のコンテキストを作成し, そのコンテキストを使うようにしてくれます.

## Prerequisites

アンインストール

## Install

Colima をインストールします.
Colima は [Homebrew](https://brew.sh/), [MacPorts](https://www.macports.org/), [Nix](https://nixos.org/) など[複数のインストール方法に対応](https://github.com/abiosoft/colima/blob/main/docs/INSTALL.md)しています.

```shell
% brew install colima  # Homebrew でインストールする場合
```

`colima version` でバージョン情報が取得できれば, Colima のインストールは完了です.

Colima は[ランタイムを選ぶことができます](https://github.com/abiosoft/colima#runtimes).
ここでは Docker をランタイムとして使用するので, Docker クライアントをインストールします.

```shell
% brew install docker
```

## Colima 101

<p class="warn">**注意**
以下の内容はバージョン `0.5.2` の Colima に基づいて記載されています.
</p>

`colima start` コマンドで新しい VM のインスタンスを作成 (もしくは既存のインスタンスを指定) して起動することが出来ます.

例えば下記の例では, CPU 数, メモリサイズ (GB), ディスクサイズ (GB) を指定して新しいインスタンスを作成し,
`$HOME/` をマウントして起動します. `:w` はボリュームを書き込み可能にするために必要です.
作成するインスタンスの名前 (`profile`) は指定がない場合は `default` になります.
また, ランタイムの種類については指定がないは `docker` になります.

```shell
% colima start --cpu 4 --memory 8 --disk 100 --mount $HOME/:w
```

成功すれば `colima list` コマンドで `default` という名前のインスタンスが表示され, STATUS が `Running` になっているはずです.
この状態であれば, Docker クライアントが Docker デーモンと `docker.sock` を経由して通信できるようになり, Docker を使用可能になります.

インスタンスを停止するためには `colima stop` コマンドを使用します.
また, PC を再起動した場合もインスタンスが停止します.
停止したインスタンスは `colima start` コマンドで再起動することが出来ます.
`profile` オプションの指定がない場合には `default` インスタンスが起動します.

インスタンスの設定は `colima start --edit` コマンドによって更新することが出来ます.
しかし, ディスクサイズについてはインスタンス作成後は変更することは出来ません.

## Tips

### Insecure registries setting

Docker Desktop では GUI を使用して insecure registries を設定することが出来ました.
Colima では [`colima start --edit` コマンドによって insecure registries の設定を行うことが出来ます](https://github.com/abiosoft/colima/blob/main/docs/FAQ.md#how-to-customize-docker-config-eg-add-insecure-registries).
`colima start --edit` コマンドによって表示される内容に下記のような部分が見つかると思いますので,
EXAMPLE に従って, `docker` セクションを更新して下さい.

```shell
# EXAMPLE - add insecure registries
# docker:
#   insecure-registries:
#     - myregistry.com:5000
#     - host.docker.internal:5000
#
# Colima default behaviour: buildkit enabled
# Default: {}
docker: {}
```

## Summary
