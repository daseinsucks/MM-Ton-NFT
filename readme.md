# NFT-Contract


## Установка
1. Команда npm install


## Подготовка к запуску
1. Необходимо загрузить файлы на IPFS.
   
1.1. Первым делом мы загружаем картинку. Для этого я использовал сервис Pinata. Картинку в формате .png помещавем в папку build/images. Переходим на сайт сервиса (https://www.pinata.cloud/), регистрируемся, нажимаем Upload, выбираем folder, загружаем папку images.
     Папка появляется в списке. Заходим в нее, нажимаем на название файла. Файл откроется по ссылке вида ..ata.cloud/ipfs/QmNvEzf5vgHLExTzYwiSfT52umEmpmbJUm4AMLy9gz5X21/1.png. Необходимо скопировать все, что после ipfs/.

1.2. Переходим в папку build/json. В файлах редактируем данные о нашем NFT. В поле image обоих файлов вставляем "ipfs://ссылкананашфайл".

1.3. Возвращаемся на сайт сервиса. Жмем Upload, выбираем файлы, которые мы редактировали. Копируем ссылки.

1.4. В папке sources открываем файл contract.deploy_api.ts. В 38 строке подставляем ссылку на файл с содержимым предмета. Должен получиться следующий формат: https://ipfs.io/ipfs/ссылкананашфайл

1.5. В 41 строке подставляем ссылку на файл metadata.json в том же формате.

3. Необходимо указать секретную фразу кошелька.

   2.1. Переименовать файл .envExsmple в .env

   2.2. В него вставить 24 слова секретной фразы из кошелька по образцу.

4. В 51 строке указать адрес кошелька, на который будут приходить Тон за минт пользователем.
5. В 55 строке указать максимальное количество NFT
6. В 60 строке указать параметры вторичной продажи. 10n = 1%.
7. В файле sources/contract.tact необходимо установить цену минта в 28 строке.
6.1. Выполнить команду yarn build.


## Запуск
1. Команда npm run api_deploy
В терминале появится адрес контракта. Если все прошло успешно, в эксплорере https://tonviewer.com/ по адресу контракта будет видна транзакция 
