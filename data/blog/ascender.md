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

私の所属している[cvpaper.challnege](http://xpaperchallenge.org/cv/)ではグループで研究活動を行っているため, グループメンバーがそれぞれの環境で 1 つの研究のための実験コードを開発する機会が頻繁にあります. しかし, これまで共通のテンプレートやコーディング規約が存在していなかったため, コードの共有や再利用, チームでの同時開発は上手く出来ていない状況でした. そこで, [XCCV グループ](http://xpaperchallenge.org/cv/xccv)の 2022 年のメタサーベイ活動の一貫としてプロジェクトテンプレートを作成することにしました. 本記事では作成したプロジェクトテンプレートの機能と使い方について簡単に紹介します.

## What is Ascender

上記のような背景で Python を用いた研究プロジェクト向けの GitHub リポジトリテンプレートである[Ascender](https://github.com/cvpaperchallenge/Ascender)を作成しました. 特徴としては下記のような点があります.

- **コンテナ仮想化**: Docker を使用することで開発環境依存を減らし, コードの移植性を向上.
- **パッケージ管理**: Poetry を使用したパッケージ管理により, 同一環境の再現性を向上.
- **コードスタイル**: Black, Flake8, isort を使用してコードスタイルを自動的に統一.
- **静的型チェック**: Mypy による静的型チェックにより, コードの信頼性を向上.
- **テスト**: pytest を使用したテストコードを簡単に使用可能.
- **GitHub 関連機能**: Pull request 時のスタイル確認・テストの workflow や issue テンプレート等を実装.

Python を用いた ML 周りのプロジェクトテンプレートとしては, [Cookiecutter Data Science](https://github.com/drivendata/cookiecutter-data-science)や[Lightning-Hydra-Template](https://github.com/ashleve/lightning-hydra-template)など既に広く使われているものもあるかと思いますが, 今回は特にチームでの同時開発を主軸とし, 開発の際に特定のライブラリの制約を出来るだけ受けないようにしました.

##

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
