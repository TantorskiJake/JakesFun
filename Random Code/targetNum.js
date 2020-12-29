function twoSum(arr,targetNum){
    for(var i = 0; i <arr.length; i++){
        for( var j = i+1; j<arr.length; j++){
            if(targetNum == arr[i]+arr[j]){
                return [i,j]
            }
        }
    }
    return "No two sum solution!";
}
twoSum([6,6,8,10],12);