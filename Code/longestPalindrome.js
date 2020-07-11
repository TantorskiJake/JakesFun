function longestPalidrome(str){

    let longestPal = " ";
    for(let i =0; i < str.length;i++){
        let evenPal = expandFromCenter(str,i,i+1)
        let oddPal = expandFromCenter(str,i,i)

        if(evenPal.length > longestPal.length){
            longestPal = evenPal;
        }
        if(oddPal.length > longestPal.length){
            longestPal = oddPal;
        }

    }
    return longestPal;
}

function expandFromCenter(str,left,right){
    while(left >= 0 && right <= str.length && str[left] == str[right]){
        left++;
        right--;
    }
    return str.slice(left+1,right)
}

var test = "banana";
longestPalidrome(test);