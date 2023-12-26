# 🌻 Перший Український Поінтовий Аукціон
Додаток, за допомогою якого стримери можуть проводити аукціони, збираючи донати на якийсь інтерактив із глядачами (пограти в якусь відеогру, почитати книгу, подивитися фільм чи відео). Пройдемося по основним фішкам по-порядку.

## 🤙 Поле вводу лотів
![input](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/input.jpg "Поле вводу лотів")

Як ви можете здогадатися, саме тут додаються нові лоти до списку. Але це ще не все, адже це поле також виконує **функцію пошуку**: щойно починається введення імені лота, ви побачите варіанти з існуючими лотами зі схожими назвами. Тут їх одразу можна і відреагувати.

![search](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/search.jpg "Функція пошуку")

## 📃 Список лотів
![list](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/lots.jpg "Список лотів")

Список. Звичайний список, який можна сортувати за назвою та ціною. Елементи списку можна редагувати, додавати або відіймати значення та видаляти лот цілком.

![item](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/lot.jpg "Лот")

## 🗑️ Смітник
![trash can](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/trashcan.jpg "Смітник")

Сюди потрапляють лоти, видалені користувачем та через програш під час аукціону в режимі "На Вибуття". Звідси елементи можна повернути до списку, чи видалити назавжди. Ці дії можна зробити індивідуально для кожного лота, або для всього звалища цілком.

## ⏱ Таймер
![timer](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/timer.jpg "Таймер")

Сподіваюсь, призначення цієї штуки зрозуміло і без будь-яких пояснень :) Після його запуску почнеться зворотній відлік. Також на сторінці з лотами з'явиться його цифрова міні-версія, де можна додати +1 хвилину до загального часу, поставити на таймер на паузу, або скинути його.

![mini-timer](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/mini_timer.jpg "Міні-Таймер")

## 🎡 Колесо Фортуни
![wheel](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/wheel.jpg "Колесо")

Місце, де відбувається весь "Екшен"! Аукціон може бути стандартним (одна прокрутка, швидкий результат), або на вибуття - кожна прокрутка викидає один лот, і відбувається це доки не залишиться один лот-переможець. Поведінку колеса можно налаштувати, вибираючи між трьох режимів швидкості. У налаштуваннях також знаходиться пункт, який пересилає на інтерактивний тестовий стенд аукціона, де можна переконатися у справедливості алгоритмів підбору переможців та лузерів.

![settings wheel](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/wheel_settings.jpg "Налаштування колеса")

Хочь я і зробив захист від "зависання" браузера під час тестування з великою кількістью циклів, розбивши цикли на кластери, все одно на слабких машинах ви можете відчути "важкість" в роботі браузера під час розрахунків.

![test](https://raw.githubusercontent.com/Shmobeny/site-point-auction/main/public/assets/img/readme_content/testing_bench.jpg "Тестовий стенд")

На цій сторінці також можно дізнатися як працює алгоритм у режимі "На Вибуття".
