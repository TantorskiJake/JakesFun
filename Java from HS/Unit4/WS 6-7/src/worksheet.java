
public class worksheet {

	public static void main(String[] args) 
	{

		int[][] A = new int[3][5];
		for(int i = 0; i <3; i++)
		{
			for(int k = 0; k<5; k++)
			{
				A[i][k] = (int)(10*Math.random()+ 0);
			}
		}
		for(int i = 0; i <3; i++)
		{
			for(int k = 0; k<5; k++)
			{
				System.out.print("" + A[i][k]+ ",");
			}
			System.out.println();
		}
		System.out.println();
		
		for(int k = 0; k<5; k++)
		{
			for(int i = 0; i<3; i++)
			{
				System.out.print("" + A[i][k]+ ",");
			}
			System.out.println();
		}
		System.out.println();
		
		int sum = 0;
		for(int i = 0; i <3; i++)
		{
			for(int k = 0; k<5; k++)
			{
				sum = sum + A[i][k];
			}
		}
		System.out.println(sum);
		System.out.println();
		
		int low = A[0][0]; int row = 0; int col =0;
		for(int i =0; i <3 ; i++)
		{
			for(int k = 0; k<5; k++)
			{
				if(A[i][k]< low)
				{
					low = A[i][k];
					row = i +1; col = k+1;
				}
			}
		}
		System.out.println("The smallest element of a was  at row " + row +" and column " + col);
		
		int[] B = new int [5];
		
		int colSum;
		
		for(int col1 =0; col1<5; col1++)
		{
			colSum = 0;
			for(int row1 =0; row1<3; row1++)
			{
				colSum += A[row][col];
			}
			B[col1]= colSum;
			System.out.print(B[col1] + " ");
			
		}
	}

}
