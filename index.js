import fs from 'node:fs'
import * as readline from "node:readline";

async function queryGraphql(template) {
    const response = await fetch('https://leetcode.cn/graphql/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(template)
    })
    const {data: {question}} = await response.json()
    if (!question) throw new Error("问题不存在")
    return question;
}

async function getQuestionContent(questionName) {
    const template = {
        "query": "\n    query questionTranslations($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    translatedTitle\n    translatedContent\n  }\n}\n    ",
        "variables": {"titleSlug": questionName},
        "operationName": "questionTranslations"
    }
    const question = await queryGraphql(template)
    return {
        title: question.translatedTitle,
        content: question.translatedContent
    }
}

async function getQuestionInfo(questionName) {
    const template = {
        "query": "\n    query questionTitle($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    title\n    titleSlug\n    isPaidOnly\n    difficulty\n    likes\n    dislikes\n    categoryTitle\n  }\n}\n    ",
        "variables": {"titleSlug": questionName},
        "operationName": "questionTitle"
    }
    const question = await queryGraphql(template)
    return {
        questionId: question.questionId,
        difficulty: question.difficulty
    }
}

async function getQuestionTags(questionName) {
    const template = {
        "query": "\n    query singleQuestionTopicTags($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    topicTags {\n      name\n      slug\n      translatedName\n    }\n  }\n}\n    ",
        "variables": {"titleSlug": questionName},
        "operationName": "singleQuestionTopicTags"
    }
    const question = await queryGraphql(template)
    return {
        tags: question.topicTags.map(item => item.translatedName)
    }
}

function generateSolutionTemplate(packageName) {
    return `package ${packageName};

class Solution1 {
    
}
`
}

function formatDate(date) {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}


async function generateQuestion(config) {
    console.log('开始生成题目...')
    try {
        let questionName
        const match = config.link.match(/^https:\/\/leetcode.cn\/problems\/(.+?)\/description\/$/)
        if (!match) throw new Error("leetcode地址不正确，无法正常解析")
        else questionName = match[1]
        const result = await Promise.all([getQuestionInfo(questionName), getQuestionContent(questionName), getQuestionTags(questionName)])
        const questionInfo = result.reduce((accumulator, currentValue) => ({...accumulator, ...currentValue}))
        const date = formatDate(new Date())
        Object.assign(questionInfo, {link: config.link, category: config.category, createTime: date, updateTime: date})
        const directoryName = `_${'0'.repeat(4 - questionInfo.questionId.length) + questionInfo.questionId}.${questionInfo.title}`
        const directoryPath = `problems/${directoryName}`
        if (fs.existsSync(directoryPath)) throw new Error("文件目录已存在，请删除后重试")
        else fs.mkdirSync(directoryPath, {recursive: true})
        fs.writeFile(`${directoryPath}/question.md`, questionInfo.content, (err) => err && console.log(err))
        delete questionInfo.content
        fs.writeFile(`${directoryPath}/meta.json`, JSON.stringify(questionInfo, null, 2), (err) => err && console.log(err))
        const solutionTemplate = generateSolutionTemplate(directoryName)
        fs.writeFile(`${directoryPath}/Solution1.java`, solutionTemplate, (err) => err && console.log(err))
        console.log('题目生成成功!')
    } catch (e) {
        console.error(e)
        console.log('题目生成失败!')
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function inputQuestionUrl() {
    rl.question('请输入 LeetCode 题目地址: ', async (answer1) => {
        if (answer1 === 'q' || answer1 === 'Q') {
            rl.close()
        } else {
            rl.question('请输入该题目分类: ', async (answer2) => {
                if (answer2 === 'q' || answer2 === 'Q') {
                    rl.close()
                } else {
                    const config = {link: answer1.trim(), category: answer2.trim()}
                    await generateQuestion(config)
                    inputQuestionUrl()
                }
            })
        }
    });
}

inputQuestionUrl()