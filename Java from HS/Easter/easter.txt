import javax.swing.JOptionPane;

public class Easter 
{
	
	//doesn't do anything, however, needed to create object in driver (WhenIsEaster class)
	public Easter()
	{
		
		
	}
	
	
	//method to implement, call from driver to use.
	public String calculateEaster(int year)
	{
		int y = year;
		int a = y %19;
		int b = y/100;
		int c = y%100;
		int d = b/4;
		int e = b%4;
		int g = (8 * b +13)/25;
		int h = (19 * a + b - d - g + 15) % 30;
	    int j = c / 4;
	    int k = c % 4;
	    int m = (a + 11 * h) / 319;
	    int r = (2 * e + 2 * j - k - h + m + 32) % 7;
	    int n = (h - m + r + 90) / 25;
	    int p = (h - m + r + n + 19) % 32;
	    
	    return "For the year "+ year + ", Easter falls on day "+ p + " of month "+ n + "."; 
		
	}
	

}