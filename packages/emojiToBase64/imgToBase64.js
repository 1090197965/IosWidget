const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = './imgToBase64'; // 输入文件夹

// 遍历输入文件夹，获取所有图片文件
const files = fs.readdirSync(inputDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
});

// 将压缩后的图片转换为 base64 编码并保存到 txt 文件中
const base64Data = files.map(file => {
  const inputDir2 = path.join(inputDir, file);
  console.log('inputDir', inputDir2);
  const data = fs.readFileSync(inputDir2);
  return {
    name: path.basename(file, path.extname(file)),
    show: false,
    path: 'data:image/png;base64,' + data.toString('base64')
  };
});

const rs = {};
base64Data.forEach(item => {
  rs[item.name] = item.path;
})
fs.writeFileSync('./imgToBase64/base64.json', JSON.stringify(rs));
