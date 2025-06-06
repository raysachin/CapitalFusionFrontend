// USER REGISTRATION

// email

export const validateEmail = (value: string): boolean => {

    const pRegex = /^[A-Za-z0-9._]+[@][A-Za-z.-]+(.com|.in)$/i;

    return pRegex.test(value);

}

// password

export const getPasswordStrength = (password: string): number => {

    let score = 0;

    if (password.length >= 3)

        score++;

    if (password.length >= 5)

        score++;

    if (password.length >= 9)

        score++;

    if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))

        score++;

    if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9].*[0-9]+/.test(password) && /[^A-Za-z0-9].*[^A-Za-z0-9]+/.test(password))

        score++;

    return score;   // range = 0 - 5

}

export const validatePassword = (value: string): boolean => {




    return (getPasswordStrength(value) === 4 || getPasswordStrength(value) === 5) ? true : false;

}






// TRANSACTION




// date

export const validateDate = (value: Date): boolean => {

    const date = new Date(value);

    const currentDate = new Date();

    return date <= currentDate;

}




// amount

export const validateAmount = (value: number): boolean => {

    return value > 0;

}




//TRANSACTION FILTER





//start date

export const validateStartDate = (startDate: Date): boolean => {

    const currentDate = new Date();

    currentDate.setHours(0);

    currentDate.setMinutes(0);

    currentDate.setSeconds(0);

    console.log(currentDate);

    startDate = new Date(startDate);

    if (startDate >= currentDate) {

        return false;

    }

    return true;

}

//end date

export const validateEndDate = (startDate: Date, endDate: Date): boolean => {

    startDate = new Date(startDate);

    startDate.setHours(0);

    startDate.setMinutes(0);

    startDate.setSeconds(0);

    startDate.setMilliseconds(0);




    endDate = new Date(endDate);

    endDate.setHours(23);

    endDate.setMinutes(59);

    endDate.setSeconds(59);

    endDate.setMilliseconds(999);




    const currentDate = new Date();

    currentDate.setHours(23);

    currentDate.setMinutes(59);

    currentDate.setSeconds(59);

    currentDate.setMilliseconds(999);




    console.log(currentDate);




    if (endDate <= startDate || endDate > currentDate) {

        return false;

    }

    return true;

};






// ASSET DATA ENTRY




// asset name

export const validateAssetName = (value: string): boolean => {

    const pRegex = /^[A-Z][A-Za-z ]+$/i;

    return pRegex.test(value);

}




// quantity

export const validateQuantity = (value: number): boolean => {

    return value > 0;

}




// purchase price

export const validatePurchasePrice = (value: number): boolean => {

    return value > 0;

}




// purchase date

export const validatePurchaseDate = (value: Date): boolean => {

    const date = new Date(value);

    const currentDate = new Date();

    return date <= currentDate;

}





//Transaction Management




//transaction type

export const validateTransactionType = (value: string): boolean => {

    return value === 'Buy' || value === 'Sell';

};




//assestname/symbol

export const validateAssetsName = (value: string): boolean => {

    const regex = /^[A-Z][A-Za=z]{0,9}/;

    return regex.test(value);

};




//quantity

export const validateQuantitys = (value: number): boolean => {

    return value > 0;

};




//purchase price

export const validatepurchaseprice = (value: number): boolean => {

    return value > 0;

};




//purchasedate

export const validatepurchasedate = (value: Date): boolean => {

    const date = new Date(value);

    const currentDate = new Date();

    return date <= currentDate;

};




//transactionfee(optional)

export const validatefee = (value: number | undefined): boolean => {

    if (value === undefined)

        return true;

    return value >= 0;

};




// export const validatefilterName=(value:string):boolean=>{

//     const regex= /^[A-Z][A-Za=z]{0,9}/i;

//     return regex.test(value);

// };




// export const validatefiltertype=(value:string):boolean=>{

//     return value==="Stock"||value==="Bond"||value==="Rent"||value==="Others"

// };




//Transaction List

// Validation.ts




export function validatefiltertype(value: string): boolean {

    return ["Transaction Type", "Asset Name", "Date"].includes(value);

}




export function validatefilterName(value: string): boolean {

    return value.trim().length > 0;

}





// FINANCIAL PLANNING




// target amount

export const validateTargetAmount = (value: number): boolean => {

    return value > 0;

}

// target date

export const validateTargetDate = (value: Date): boolean => {

    const date = new Date(value);

    const currentDate = new Date();

    return date > currentDate;

}

// current savings

export const validateCurrentSavings = (value: number): boolean => {

    return value > 0;

}