/**
 * Pixel Game - Google Apps Script Backend
 * 
 * 工作表需求：
 * 1. "題目" (欄位：題號, 題目, A, B, C, D, 解答) -> 解答要是選擇的字母 A/B/C/D
 * 2. "回答" (欄位：ID, 闖關次數, 總分, 最高分, 第一次通關分數, 花了幾次通關, 最近遊玩時間)
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId(); // 綁定於現有 Sheet 則可以直接取得

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === 'getQuestions') {
      return handleGetQuestions(payload);
    } else if (action === 'submitScore') {
      return handleSubmitScore(payload);
    } else {
      return createJsonResponse({ status: 'error', message: 'Unknown action' });
    }
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function handleGetQuestions(payload) {
  const count = payload.count || 10; // 前端傳入需要幾題
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('題目');
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return createJsonResponse({ status: 'error', message: 'Sheet "題目" is empty' });
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  // 洗牌
  const shuffledRows = rows.sort(() => 0.5 - Math.random());
  const selectedRows = shuffledRows.slice(0, count);
  
  const questions = selectedRows.map(row => {
    return {
      id: row[0],
      question: row[1],
      options: {
        A: row[2],
        B: row[3],
        C: row[4],
        D: row[5]
      }
      // 不傳送 answer 回前端
    };
  });
  
  return createJsonResponse({ status: 'success', data: { questions } });
}

function handleSubmitScore(payload) {
  const playerId = payload.playerId;
  const answers = payload.answers || []; // [{ id: '1', selected: 'A' }, ...]
  const passThreshold = payload.passThreshold || Math.ceil(answers.length * 0.6); // 預設 60% 過關
  
  // 1. 對答案算分
  const sheetQ = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('題目');
  const qData = sheetQ.getDataRange().getValues();
  // 建立解答字典 (id -> answer)
  const answerMap = {};
  for (let i = 1; i < qData.length; i++) {
    answerMap[qData[i][0]] = qData[i][6]; // 假設欄位 G 是解答
  }
  
  let score = 0;
  for (const ans of answers) {
    if (answerMap[ans.id] && answerMap[ans.id].toString().toUpperCase() === ans.selected.toString().toUpperCase()) {
      score += 1;
    }
  }
  
  const isPassed = score >= passThreshold;

  // 2. 寫入或更新「回答」Sheet
  const sheetA = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('回答');
  const aData = sheetA.getDataRange().getValues();
  
  let rowIndex = -1;
  // 找尋現有的 ID
  for (let i = 1; i < aData.length; i++) {
    if (aData[i][0].toString() === playerId) {
      rowIndex = i + 1; // getRange 是 1-based
      break;
    }
  }
  
  const now = new Date();
  
  // 欄位: ID(1), 闖關次數(2), 總分(3), 最高分(4), 第一次通關分數(5), 花了幾次通關(6), 最近遊玩時間(7)
  
  if (rowIndex !== -1) {
    // 既有玩家
    const currentPlayCount = Number(sheetA.getRange(rowIndex, 2).getValue()) || 0;
    const currentTotalScore = Number(sheetA.getRange(rowIndex, 3).getValue()) || 0;
    const currentHighest = Number(sheetA.getRange(rowIndex, 4).getValue()) || 0;
    let firstClearScore = sheetA.getRange(rowIndex, 5).getValue();
    let attemptsToClear = sheetA.getRange(rowIndex, 6).getValue();
    
    const newPlayCount = currentPlayCount + 1;
    const newTotalScore = currentTotalScore + score;
    const newHighest = Math.max(currentHighest, score);
    
    if (isPassed && (!firstClearScore)) {
      firstClearScore = score;
      attemptsToClear = newPlayCount;
    }
    
    sheetA.getRange(rowIndex, 2).setValue(newPlayCount);
    sheetA.getRange(rowIndex, 3).setValue(newTotalScore);
    sheetA.getRange(rowIndex, 4).setValue(newHighest);
    
    if (isPassed && firstClearScore && !sheetA.getRange(rowIndex, 5).getValue()) {
      sheetA.getRange(rowIndex, 5).setValue(firstClearScore);
      sheetA.getRange(rowIndex, 6).setValue(attemptsToClear);
    }
    sheetA.getRange(rowIndex, 7).setValue(now);
    
  } else {
    // 新玩家
    const firstClearScore = isPassed ? score : '';
    const attemptsToClear = isPassed ? 1 : '';
    sheetA.appendRow([
      playerId, 
      1, // 闖關次數
      score, // 總分
      score, // 最高分
      firstClearScore,
      attemptsToClear,
      now
    ]);
  }
  
  return createJsonResponse({ 
    status: 'success', 
    data: { 
      playerId,
      score,
      isPassed
    } 
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 這個是為了允許 OPTIONS 請求 (CORS 預檢請求)
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}
