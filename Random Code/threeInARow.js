function threeInARow(arr){
    var oddCounter = 0;
    var evenCounter = 0;

    for(var i = 0; i <arr.length;i++){
        if(arr[i]%2==0){
            evenCounter++;
            oddCounter = 0;
            if(evenCounter >= 3){
                console.log("3 Evens in a Row: " + arr[i-2]+" "+ arr[i-1]+ " " + arr[i])
            }
        }
        if(arr[i]%2==1){
            oddCounter++;
            evenCounter = 0;
            if(oddCounter >= 3){
                console.log("3 Odds in a Row: " + arr[i-2]+" "+ arr[i-1]+ " " + arr[i])
            }
        }
    }
}

var evenGood = [1,2,6,4,5,8,9,7,6];
var oddGood = [1,2,3,4,5,7,9,8,6];
var both = [2,4,6,7,9,1,8,5,3];


//threeInARow(evenGood);
//threeInARow(oddGood);
threeInARow(both);

