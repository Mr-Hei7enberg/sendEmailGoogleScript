const id = "<ваша таблица>"; //id таблицы

function sendEmail() {
  
  var email = 0; // Индекс имейл в массиве data
  var firstName = 1; // Индекс имени в массиве data
  var lastName = 2; // Индекс фамилии в массиве data
  var phone = 3; // Индекс телефона в массиве data
  
  var ui = SpreadsheetApp.getUi();
  var emailTemp = HtmlService.createTemplateFromFile("email");
  var sheet = SpreadsheetApp.openById(id).getSheetByName("Пользователи");
  var data = sheet.getRange(5, 1, sheet.getLastRow()-1, 5).getValues();
  var subject = sheet.getRange(2, 1).getValue();
  var name = sheet.getRange(2, 2).getValue();
  var quota = MailApp.getRemainingDailyQuota();
  var countEmail = data.filter( // Фильтруем массив на пустые ячейки и флажок
    function(item){
      if (item[4] === true) {
        return !item.some(function(cell) {
          return cell === "";
        })
      }
    }).length;
  
  
  if (countEmail > quota) { // Если количество ✉️ больше квоты
    if (quota == -1 || quota == 1) {
      SpreadsheetApp.openById(id).toast(`Осталось: 0 📧️,\nвы пытаетесь отправить: ${countEmail} ✉️`, '⚠️ Предупреждение️')
      sheet.getRange(2, 4).setValue(0) // Записываем остаток
    } else {
      SpreadsheetApp.openById(id).toast(`Осталось: ${quota} 📧,\nвы пытаетесь отправить: ${countEmail} ✉️`, '⚠️ Предупреждение️')
      sheet.getRange(2, 4).setValue(quota) // Записываем остаток
    }
    
  } else if (quota >= countEmail && countEmail == 0) { // Если квота больше количества сообщений равно 0
    SpreadsheetApp.openById(id).toast("Список получателей пуст 👩\nПоставте ☑️", '⚠️ Предупреждение️')
    
  } else if (quota >= countEmail && countEmail != 0) { // Если квота больше количества сообщений и количество сообщений больше 0
    var button = ui.alert("Подтверждаете отправку " + countEmail + " 📧 писем?", ui.ButtonSet.YES_NO);
    
    if (button == ui.Button.YES) {
      SpreadsheetApp.flush(); // Применяет все ожидающие изменения таблицы   
      data = data.filter( // Фильтруем массив на пустые ячейки и флажок
        function(item){
          if (item[4] === true) {
            return !item.some(function(cell) {
              return cell === "";
            })
          }
        });
      
      data.forEach(item => { // Запускаем цикл отправки email
                   emailTemp.firstName = item[firstName];
                   emailTemp.lastName = item[lastName];
                   emailTemp.phone = item[phone];
                   emailTemp.name = name;
                   var htmlMessage = emailTemp.evaluate().getContent();
      GmailApp.sendEmail(
        item[email], 
        subject, 
        "Ваша почта не поддерживает HTML",
        {name: name,
         htmlBody: htmlMessage
        });
    });
    
    quota = quota-data.length; // Отнимает от остатка количество сообщений
    SpreadsheetApp.openById(id).toast(`Вы отправили: ${data.length} 📧️,\nосталось: ${quota} ✉️`, '⚠️ Предупреждение️');
    sheet.getRange(2, 4).setValue(quota); //Записываем остаток
  }
} 
}


function updateQuota() { // Обновляет значение квоты по триггеру раз в час
  var sheet = SpreadsheetApp.openById(id).getSheetByName("Пользователи");
  var quota = MailApp.getRemainingDailyQuota();
  sheet.getRange(2, 4).setValue(quota) //Записываем остаток
}