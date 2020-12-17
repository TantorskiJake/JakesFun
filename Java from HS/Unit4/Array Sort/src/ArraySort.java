import java.util.Arrays;

public class ArraySort 
{

	public static void main(String[] args) 
	{
		int [] array = new int[100];
		
		for( int i = 0; i < 100; i++)
		
			array[i] = (int)(1000 * Math.random() + 1);
		
		Arrays.sort(array);
		
		for( int i = 0; i < array.length; i++)
			System.out.print(array[i] + ", ");
		
		int keyLocation = linearSearch(array,543);
		
		if(keyLocation == -1)
			System.out.println("Not there.");
		else
			System.out.println("There");
		
		
		
		
	}
	
	public static int linearSearch(int[] intArr, int key)
	{
		
		for ( int i = 0 ; i < intArr.length; i++)
		{
			if(intArr[i] == key)
				return i;
		}
		
		return -1;
	}
	 int[] data;
	   
	 
	    public boolean binarySearch(int[] intArray, int key) 
	    {
	          int low = 0;
	          int high = intArray. length- 1;
	           
	          while(high >= low) {
	              int middle = (low + high) / 2;
	              if(data[middle] == key) {
	                 return true;
	             }
	              if(data[middle] < key) {
	                low = middle + 1;
	             }
	              if(data[middle] > key) {
	                  high = middle - 1;
	             }
	         }
	        return false;
	    }
		
		
		
		
		
	

}
