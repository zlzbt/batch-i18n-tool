/** 注意：当前仅适用于英文国际化的更新 */
const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx'); // excel;
const configs = require('./config'); // config;
const jsonFormat = require('json-format'); // jsonFormat;

// 需要替换的文件夹
const sourceDirectory = path.resolve(configs.sourceDirectory);
// 需要被替换的文件夹
const originDirectory = configs.originDirectory;
// plugin文件夹下的目录
const innerFile = configs.innerFile;
// excel数据的key前缀
const preffix = configs.preffix;
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
                                fileOriginReset(originDirectory, latestConfigMap);
                            }
                        }
                    }
                })
            });
        }
    });
}

/* const fileOriginReset = (filePath, latestConfigs) => {
    const timeSuffix = new Date().getTime();
   
     //根据文件路径读取文件，返回文件列表
     fs.readdir(filePath, (err, files) => {
        if(err){
            console.warn(err);
        }else{
            let logInfo = "";
            //遍历读取到的文件列表
            files.forEach((filename) => {
                //获取当前文件的绝对路径
                const filedir = path.join(filePath, filename); // 各种plugins
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, (eror, stats) => {
                    if(eror) {
                        console.warn('获取文件stats失败');
                    }else {
                        const isDir = stats.isDirectory();//是文件夹
                        if(isDir) {
                            const i18nFile = path.join(filedir, innerFile); 
                            console.log('2、>>>>需要更新的国际化文件地址:', i18nFile);
                            // const content = fs.readFileSync(i18nFile, 'utf-8');
                            const originI18nJson = require(i18nFile);
                            console.log('>>>originI18nJson:', originI18nJson);
                            const newOriginI18nJson = {};
                            logInfo = `更新国际化文件地址: ${i18nFile}: \n`;
                            Object.keys(originI18nJson).forEach(item => {
                                const prevI18nItem = originI18nJson[item];
                                logInfo += `>>>>${item} 的更新记录：${prevI18nItem}  ---> ${latestConfigs?.[`${preffix}${item}`]?.value} \n`;
                                newOriginI18nJson[item] = latestConfigs?.[`${preffix}${item}`]?.value || prevI18nItem;
                            });
                            // 输出
                             fs.writeFileSync(i18nFile, "'use strict';\n module.exports = " + jsonFormat(newOriginI18nJson));
                            // 日志
                            // fs.writeFileSync(`./logs/${filename}_en_US.js`, "'use strict';\n module.exports = " + jsonFormat(newOriginI18nJson));
                            fs.writeFileSync(`./logs/log_${filename}_${timeSuffix}.txt`, logInfo);
                        }
                    }
                })
            });
            
        }
    });

} */

const fileOriginReset = (filePath, latestConfigs) => {
    const timeSuffix = new Date().getTime();
   
     //根据文件路径读取文件，返回文件列表
     fs.readdir(filePath, (err, files) => {
        if(err){
            console.warn(err);
        }else{
            let logInfo = "";
            //遍历读取到的文件列表
            files.forEach((filename) => {
                // if (filename !== 'server-evo-framework' /* && filename !== 'server-basic-open-positions-disposition-plugin' */) {
                //     return;
                // }
                //获取当前文件的绝对路径
                const filedir = path.join(filePath, filename); // 各种plugins
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, (eror, stats) => {
                    if(eror) {
                        console.warn('获取文件stats失败');
                    }else {
                        const isDir = stats.isDirectory();//是文件夹
                        if(isDir) {
                            const i18nFile = path.join(filedir, innerFile); 
                            console.log('2、>>>>需要更新的国际化文件地址:', i18nFile);
                            // const content = fs.readFileSync(i18nFile, 'utf-8');
                            const originI18nJson = require(i18nFile);
                            console.log('>>>originI18nJson:', originI18nJson);
                            const newOriginI18nJson = {};
                            logInfo = `更新国际化文件地址: ${i18nFile}: \n`;
                            Object.keys(originI18nJson).forEach(item => {
                                const level1Item = originI18nJson[item];
                                if(typeof level1Item === 'string') { // string
                                    if(latestConfigs && latestConfigs[`${preffix}${item}`]){
                                        newOriginI18nJson[item] = latestConfigs[`${preffix}${item}`].value;
                                        logInfo += `>>>>${item} 的更新记录：${level1Item}  ---> ${latestConfigs[`${preffix}${item}`].value} \n`;
                                    }else{
                                        newOriginI18nJson[item] = level1Item;
                                    }
                                } else { // 对象
                                    const newLevel1Items = {};
                                    Object.keys(level1Item).forEach((itr1 => {
                                        const level2Item = level1Item[itr1];
                                        if(typeof level2Item === 'string') {
                                            if(latestConfigs && latestConfigs[`${preffix}${item}.${itr1}`]){
                                                newLevel1Items[itr1] = latestConfigs[`${preffix}${item}.${itr1}`].value;
                                            }else{
                                                newLevel1Items[itr1] = level2Item;
                                            }
                                            // newLevel1Items[itr1] = latestConfigs?.[`${preffix}${item}.${itr1}`]?.value || level2Item;
                                        } else {
                                            const newLevel2Items = {};
                                            Object.keys(level2Item).forEach((itr2 => {
                                                const level3Item = level2Item[itr2];
                                                if(latestConfigs && latestConfigs[`${preffix}${item}.${itr1}.${itr2}`]){
                                                    newLevel2Items[itr2] = latestConfigs[`${preffix}${item}.${itr1}.${itr2}`].value;
                                                }else{
                                                    newLevel2Items[itr2] = level3Item;
                                                }
                                                // newLevel2Items[itr2] = latestConfigs?.[`${preffix}${item}.${itr1}.${itr2}`]?.value || level3Item;
                                            }));
                                            newLevel1Items[itr1] = newLevel2Items;
                                        }
                                    }));
                                    newOriginI18nJson[item] = newLevel1Items;
                                    logInfo += `>>>>${item} 的更新记录：${level1Item}  ---> ${newLevel1Items} \n`;
                                }
                            });

                            // 输出
                            fs.writeFileSync(i18nFile, "'use strict';\n module.exports = " + jsonFormat(newOriginI18nJson));
                            // 日志
                            // fs.writeFileSync(`./logs/${filename}_en_US.js`, "'use strict';\n module.exports = " + jsonFormat(newOriginI18nJson));
                            fs.writeFileSync(`./logs/log_${filename}_${timeSuffix}.txt`, logInfo);
                        }
                    }
                })
            });
            
        }
    });

}

fileSourceDisplay(sourceDirectory);


