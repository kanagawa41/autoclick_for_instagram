/**
 * 概要: タスクの名前管理
 */
module.exports = class TaskNamespace {
  // ネームの区切り文字
  get DELIMITER(){ return ":"; }
  get DELIMITER_FOR_FILE(){ return "_"; }

  namespace(){ return null; }

  getTaskName(){
    const className = this.constructor.name.replace(/Task$/, '');
    return this._toSnakCase(className);
  }

  _toSnakCase(name){
    return name.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "");
  }

  getFullTaskName(){
    const namespace = this.namespace();
    const taskName = this.getTaskName();
    return namespace ? namespace + this.DELIMITER + taskName : taskName;
  }

  // ファイル出力のため
  getFullTaskNameForFile(){
    return this.getFullTaskName().replace(new RegExp(this.DELIMITER), this.DELIMITER_FOR_FILE);
  }
}
