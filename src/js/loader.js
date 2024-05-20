const loader=document.createElement('div');
const loaderSpinner=document.createElement('div');

loader.classList.add('loader');
loaderSpinner.classList.add('loader__spinner');
loader.append(loaderSpinner);

export const showLoader=()=>{
    document.body.append(loader);
}
export const removeLoader=()=>{
    loader.remove();
}