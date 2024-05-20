import { showLoader ,removeLoader} from "./loader";


//апи сервера
const API_URL= 'https://sequoia-half-screen.glitch.me';
const storeList=document.querySelector('.store__list');

//функция получения списка товаров по категории
const renderCarts=(products)=>{
    storeList.textContent=' ';
    products.forEach(({id,name,price,photoUrl})=>{
    const storeItem=document.createElement('li');
    storeItem.classList.add('store__item');
    storeItem.innerHTML=`
    <article class="store__product product">
    <h3 class="product__title">${name}</h3>
    <img class="product__image" src="${API_URL}${photoUrl
    }" alt="${name}" width="264" height="229">
    <b class="product__price">${price} ₽</b>
    <button class="product__button" data-id=${id} type="button">
        Заказать
    </button>
    </article>
    `;
    storeList.appendChild(storeItem);
    }); 
}
//функция получения массива товаров по запросу 
export const getFetching=async(category)=>{
    showLoader();
    try{
     const responce=await fetch(`${API_URL}//api/products/category/${category}`);
     if(!responce.ok){
       throw new Error(responce.status);
     }
     const productsArray=await responce.json();
      
     renderCarts(productsArray);
   } catch(error){
     console.error(`Ошибка:${error}`);
    } finally{
        removeLoader();
    }
}

