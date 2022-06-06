/** 注意：当前仅适用于英文国际化的更新 */
const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx'); // excel;
const configs = require('./config'); // config;
const jsonFormat = require('json-format'); // jsonFormat;

// 需要替换的文件夹
const sourceDirectory = path.resolve(configs.sourceDirectory);

// excel数据的key前缀
const preffix = "evo.web.client.";
//

const getExcelFile = (sheets) => {
    // 第一张sheet
    const sheet = sheets[0];
    let newSheetsMap = {};
        //sheet是一个json对象，格式为{name:"测试参数",data:[]},我们想要的数据就存储在data里
        for(let i=3; i < sheet["data"].length; i++) { //excel文件里的表格一般有标题所以不一定从0开始
            const row = sheet['data'][i];
            if(row && row.length > 0){
                if(String(row[0]).startsWith(preffix) && !!row[2]) {
                    newSheetsMap[row[0]] = {
                        value: row[2],
                        type: row[1],
                        key: row[0], //row[0]对应表格里A这列
                    }
                }
            }
        }
    return newSheetsMap;
}

//文件遍历方法
const fileSourceDisplay = (filePath) => {
    // let latestConfigs = [];
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, (err, files) => {
        // console.log('>>>filePath:', filePath);
        if(err) {
            console.warn(err);
        } else {
            //遍历读取到的文件列表
            files.forEach((filename) => {
                //获取当前文件的绝对路径
                const filedir = path.join(filePath, filename); 
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, (eror, stats) => {
                    if(eror) {
                        console.warn('获取文件stats失败');
                    }else {
                        const isFile = stats.isFile();//是文件
                        if(isFile) {
                            console.log(filedir);
　　　　　　　　　　　　　　　// 读取文件内容
                            const obj = xlsx.parse(filedir);
                            const latestConfigMap = getExcelFile(obj);
                            // 更新原有文件
                            if(latestConfigMap && Object.keys(latestConfigMap).length > 0) {
                                console.log("1、>>>>读取EXCEL文件 —— —— 当前需要更新的行数： ", Object.keys(latestConfigMap).length);
                                // plugin中国际化文件解析
                                fileOriginReset(latestConfigMap);
                            }
                        }
                    }
                })
            });
        }
    });
}

const fileOriginReset = (latestConfigs) => {
    const originI18nJson = require('./client/origin.js');
    console.log('>>>originI18nJson:', originI18nJson);
    let logInfo = "";
    const newOriginI18nJson = {};
    Object.keys(originI18nJson).map(item => {
        if(originI18nJson[item] !== latestConfigs?.[`${preffix}${item}`]?.value ) {
            logInfo += `>>>>${item} 的更新记录：${originI18nJson[item]}  ---> ${latestConfigs?.[`${preffix}${item}`]?.value} \n`;
        }
        newOriginI18nJson[item] = latestConfigs?.[`${preffix}${item}`]?.value || originI18nJson?.[item];
    });
    // 输出
    fs.writeFileSync(`./client/output/temp.js`, "const local = " + jsonFormat(newOriginI18nJson) + '; \nexport default locale;');
    // 日志
    fs.writeFileSync(`./logs/log_client.txt`, logInfo);
}

fileSourceDisplay(sourceDirectory);


