#!/bin/sh

# FIXME: sudoなしで実行するようにする（全部がroot権限でめんどくさい）
# プロジェクトの上位層に配置して、'sudo'で実行してください。

# シェルパス
SCRIPT_DIR=$(cd $(dirname $0); pwd)

###
# パスワード入力
###
password(){
    if ! ${password+:} false
    then
        printf "password: "
        read -s password
    fi
}

password

# 設定必要！！！
GIT_USERNAME=
# 設定必要！！！
GIT_PASSWORD=
GIT_REPO=https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/kanagawa41/autoclick_for_instagram.git

PROJECT_NAME=insta_click
PROJECT_DB_NAME=inst_clk.sqlite3
BACKUP_DIR=bk

mkdir ${BACKUP_DIR}

DOCKER_PROCESS_NAME=c_chromium
if [ $# -ne 1 ]; then # 引数があればイメージを削除する
  DOCKER_IMAGE_NAME=
else
  DOCKER_IMAGE_NAME=instaclick_batch
fi
echo 'ファイルをコピーします。'
# dbファイルをコピー
echo "$password" | sudo -S cp ${PROJECT_NAME}/db/${PROJECT_DB_NAME} ${BACKUP_DIR}/
ret=$?
if [ $ret -ne 0 ]; then
  echo 'エラー：DBをコピーできませんでした。'
  exit 1
fi
echo "$password" | sudo -S cp ${PROJECT_NAME}/.env ${BACKUP_DIR}/

echo 'ドッカーのプロセスを削除します。'
# dockerのプロセスのキル
docker kill ${DOCKER_PROCESS_NAME}
docker rm ${DOCKER_PROCESS_NAME}
docker rmi ${DOCKER_IMAGE_NAME}

echo 'プロジェクトを削除します。'
# プロジェクトを削除
echo "$password" | sudo -S rm -rf ${PROJECT_NAME}

echo 'プロジェクトをチェックアウトします。'
# git clone
git clone ${GIT_REPO} ${PROJECT_NAME}

echo 'DBのバックアップを元に戻します。'
echo "$password" | sudo -S cp ${BACKUP_DIR}/${PROJECT_DB_NAME} ${PROJECT_NAME}/db/
echo "$password" | sudo -S cp ${BACKUP_DIR}/.env ${PROJECT_NAME}/

cd ${PROJECT_NAME}

# dockerの起動
echo 'ドッカーをビルドします。'
/usr/local/bin/docker-compose build

echo 'ドッカーをデーモン起動します。'
/usr/local/bin/docker-compose up -d

echo '※※※※※※※※'
echo 'おしまい'
echo '※※※※※※※※'
