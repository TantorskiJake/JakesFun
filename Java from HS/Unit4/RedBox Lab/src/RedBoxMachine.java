import java.util.ArrayList;
import java.util.Scanner;
import java.io.File;
import java.io.FileNotFoundException;

/**
 * This class represents a Redbox Machine that allows users
 * to rent and return movies.
 * @author
 * @version 1.0
 */
public class RedBoxMachine
{
   //Create a class instance variable to hold all of the DVDs.
   
   /** the list of DVDs */
	ArrayList<DVD> dvdList;
	
	
   
   /** Constructs a Redbox Machine and fills it with DVD's
    *  Reads the file MovieList.txt so make sure that the
    *  file is in the same folder as the RedboxMachine.class
    *  file.
    */
   public RedBoxMachine()
   {
      //Complete the constructor.
      dvdList = new ArrayList<DVD>();
      
      //Leave this method. It will fill the machine with DVD's.
      fillMachine();
   }
   
   /** Searches for the movie with the provided title and returns
    *  the position of the DVD in the list if the DVD is found and
    *  -1 if the DVD is not in the list.
    *  @param title the title of the DVD being searched for.
    *  @return the index of the DVD in the list if present and
    *          -1 if the DVD is not in the list.
    */
   public int searchForMovie(String title)
   {
	   for(int i = 0; i < dvdList.size(); i++)
	   {    
		   if(dvdList.get(i).getTitle().equals(title)) 
		   return i;   
	   }	
	   return -1;
   }
   
   /** Returns the titles of all available DVD's in
    *  the machine.
    *  @return an ArrayList of Strings containing the
    *          titles of all available movies.
    */
   public ArrayList<String> getAvailableMovies()
   {
	   ArrayList<String> temp = new ArrayList<String>();
     for(int i = 0; i < dvdList.size(); i++)
     {
    	temp.add(dvdList.get(i).getTitle());
     }
    	return temp;
    	  
	   
	   
	   
	   
	   
   }
   
   /** Allows a customer to rent a movie. When the movie is rented, the number 
    *  of available copies is reduced by 1. If there are 0 copies of the movie left
    *  after the transaction, the movie is removed from the list.
    *  the movie from the list.
    *  @param title the title of the movie being rented.
    *  @return true if the movie was found and rented successfully, and false
    *          otherwise.
    */
   public boolean rent(String title)
   {
      //Complete the method to rent a movie.
	  for(int i=0;i<getAvailableMovies().size();i++)
	  {
	   if(dvdList.get(i).getTitle().equals(title))
	   {
		   dvdList.get(i).decrementCopies();
		   return true;
				   
	   }
	  }
		   
	  
      return false; //here so the program compiles.
   }
   
   /** Allows a customer to return a movie. When the movie is returned, the number 
    *  of available copies is increased by 1. If the movie was not already in the 
    *  machine, then the DVD is added to the list.
    *  @param title the title of the movie being returned.
    *  @return the DVD that was returned by the customer.
    */ 
   public DVD returnMovie(String title)
   {
	   for(int i = 0; i < getAvailableMovies().size(); i++)
	   {
		if(dvdList.get(i).getTitle().equals(title))
		{
			dvdList.get(i).incrementCopies();
			return dvdList.get(i);
		}
	   }
	DVD returnedMovie = new DVD (title);
	dvdList.add(returnedMovie);
	return returnedMovie;
	   
		
	   
	  
   }
   
   /** This method fills the machine with movies. You do not have
    *  to do anything to the code in this method.
    */
   private void fillMachine()
   {
      try{
         Scanner sn = new Scanner(new File("MovieList.txt"));
         while(sn.hasNextLine())
            returnMovie(sn.nextLine());
              
      }catch(FileNotFoundException e){
         String s = "File not found! Make sure that MovieList.txt ";
         s = s + "is in the project folder.";
         System.out.println(s);
      }
   }
}