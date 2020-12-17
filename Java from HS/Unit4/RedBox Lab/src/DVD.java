public class DVD
{
   //Declare the class variables.
   
   /** the title of the DVD */
   private String title;
   /** the number of available copies */
   private int copies;
   
   /** Constructs a DVD object and sets the number of copies
    *  to 1.
    *  @param t the title of the DVD
    */
   public DVD(String t)
   {
      //Complete the constructor.
	   title = t;
	   copies = 1;
   }
   
   /** Increments the number of available copies of this DVD.
    */
   public void incrementCopies()
   {
      //Complete the method.
	   copies++;
   }
   
   /** Decrements the number of available copies of this DVD.
    */
   public void decrementCopies()
   {
      //Complete the method.
	   copies--;
   }
   
   /** Gets the title of this DVD.
    *
    *  @return the title of the DVD.
    */
   public String getTitle()
   {
      //Complete the method.
      return title; //Here so that the program compiles.
   }
   
   /** Gets the number of available copies for this DVD.
    *
    *  @return the number of available copies.
    */
   public int getNumCopies()
   {
      //Complete the method.
      return copies; //here so the program compiles.
   }
   
   /** Returns a representation of this DVD object as a
    *  String in the format <title> copies: <num. copies>.
    *
    *  @return the String representation of the DVD.
    */
    
   public String toString()
   {
      //Complete the method.
      return title + " copies " + copies; //here so the program compiles.
   }
   
}