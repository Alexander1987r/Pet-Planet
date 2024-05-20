
import { fetchProductByCategory } from "./data.js";
const buttons=document.querySelectorAll('.store__categories-button');


const modalOverlay=document.querySelector('.modal-overlay');
const modalList=modalOverlay.querySelector('.modal__list');
const modalOverlayButton=modalOverlay.querySelector('.modal-overlay_button');

const storeButton=document.querySelector('.store__button');
const cartCount=storeButton.querySelector('.store__button-count');

const storeList=document.querySelector('.store__list');

//адресс
const API_URL= 'https://sequoia-half-screen.glitch.me';

export const getModal=()=>{

const fetchCartItems=async (ids)=>{
 try{
    const responce=await fetch(`${API_URL}/api/products/list/${ids.join(',')}`);
    if(!responce.ok){
        throw new Error(responce.status);
    }
    return responce.json();
 } catch(error){
   console.error(`Ошибка запроса товаров для корзины: ${error}`);
   return [];
 }
}

//функция вывода карточки в попап
const renderCartItems= ()=>{
  modalList.textContent='';
  const cartItems=JSON.parse(localStorage.getItem('cartItems') || '[]');
  const products=JSON.parse(localStorage.getItem('cartProductDetails') || '[]');
  
  products.forEach(({id,name,price,photoUrl})=>{
    const cartItem=cartItems.find(item => item.id === id);
    console.log(cartItem);
    if(!cartItem){
      return;
     }
   const listItem=document.createElement('li');
   listItem.classList.add('modal__item');
   listItem.innerHTML=`
   <h3 class="modal__item-title">
         ${name} 
    </h3>
    <img class="modal__item-image" src="${API_URL}${photoUrl}" alt="${name}" width="54" height="54">
          <div class="modal__item-buttons">
            <button class="modal__item-button" data-id=${id}  type="button">-</button>
            <span class="modal__item-count">${cartItem.count}</span>
            <button class="modal__item-button" type="button" data-id=${id} >+</button>
          </div>
          <p class="modal__item-price">${price * cartItem.count}</p>
   `;  
   modalList.append(listItem);
  });
  
}
/*функция закрытия модального окна*/
const closeModal=()=>{
    modalOverlay.style.display='none';  
    modalOverlayButton.removeEventListener('click',closeModal);    
}
//функция открыти модального окна
const openModal=async ()=>{
  modalOverlay.style.display='flex';
  const cartItems=JSON.parse(localStorage.getItem('cartItems') || '[]');
  const ids=cartItems.map((item)=>item.id);
  if(!ids.length){
    const listItem=document.createElement('li');
    listItem.textContent='Корзина пуста'
    modalList.appendChild(listItem);
    return;
  }
  const products =  await fetchCartItems(ids);
  localStorage.setItem('cartProductDetails',JSON.stringify(products));


  renderCartItems();
  modalOverlayButton.addEventListener('click',closeModal);  
}
//обработчик события на тогле открытия
storeButton.addEventListener('click',openModal);


//функция добавления товара в корзину(localStorage)
const addToCart=(productId)=>{
    const cartItems=JSON.parse(localStorage.getItem('cartItems') || '[]');
    console.log(cartItems);      
    const existingItem=cartItems.find((item)=>item.id === productId);


    if(existingItem){  
      existingItem.count += 1;
    } else {
      cartItems.push({id:productId,count:1});   
    }
    
    localStorage.setItem("cartItems",JSON.stringify(cartItems)); 
    updateCartCount();
}
//функция обновления строки с количествои товаров
const updateCartCount=()=>{
    const cartItems=JSON.parse(localStorage.getItem('cartItems') || '[]');
    cartCount.textContent=cartItems.length;
}


//обработчик события на списке(при клике добавление в корзину)
storeList.addEventListener('click',({target})=>{
    if(target.closest('.product__button')){
       const productId=target.dataset.id;
       
       addToCart(productId);
     }
});
updateCartCount();
}

export const getActiveLink=()=>{
    //функ переключения
    const getActiveButton=(evt)=>{
        const target=evt.target;
        const category=target.textContent;
        console.log(category);
        buttons.forEach((button)=>{
            button.classList.remove('store__categories-button_active');
        });
        target.classList.add('store__categories-button_active');
        fetchProductByCategory(category);
    }
    buttons.forEach((elem)=>{
        elem.addEventListener('click',getActiveButton);
        
        if(elem.classList.contains('store__categories-button_active')){
            fetchProductByCategory(elem.textContent);
        }
    });

}