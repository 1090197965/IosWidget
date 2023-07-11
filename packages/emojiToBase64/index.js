const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = './input'; // 输入文件夹
const outputDir = './output'; // 输出文件夹

// 遍历输入文件夹，获取所有图片文件
const files = fs.readdirSync(inputDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
});

// 压缩图片并保存到输出文件夹
files.forEach(file => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);
  sharp(inputPath)
    .jpeg({ quality: 70 }) // 修改 JPEG 图片质量
    .png({ compressionLevel: 7 }) // 修改 PNG 图片压缩级别
    .resize(80, 80, {
      fit: 'inside'
    })
    .toFile(outputPath);
});

// 将压缩后的图片转换为 base64 编码并保存到 txt 文件中
const base64Data = files.map(file => {
  const outputPath = path.join(outputDir, file);
  console.log('outputPath', outputPath);
  const data = fs.readFileSync(outputPath);
  return JSON.stringify({
    name: path.basename(file, path.extname(file)),
    show: false,
    path: 'data:image/png;base64,' + data.toString('base64')
  });
});
fs.writeFileSync('./output/base64.json', base64Data.join('\n'));
