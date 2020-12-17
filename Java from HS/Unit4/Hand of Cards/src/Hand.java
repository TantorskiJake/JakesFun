
import java.util.Arrays;
import java.util.ArrayList;

/*   Array version
    An object of type Hand represents a hand of cards.  The maximum number of
    cards in the hand can be specified in the constructor, but by default is 5. You may
    add any other variables you think you need to maintain this class. 
*/

public class Hand
 {
	private ArrayList<Card> hand;	// the cards in the hand	

   public Hand() 
   {
         // create a Hand object of 5 initially empty cells (null values).
	   hand = new ArrayList<Card>();
	   
      
   }
   
   public void clear() 
   {
         // Discard all the cards from the hand.
	   	//  set all elements to null
	  hand.clear();
      
   }
   public void addCard(Card c) 
   {
         // Add the card c to the hand.
	   
	   hand.add(c);
      
   }
   public void removeCard(Card c) 
   {
         // If the specified card is in the hand, it is removed.
	  
	   hand.remove(c);
	   
      
   }
   public void removeCard(int position)
   {
         // If the specified position is a valid position in the hand,
         // then the card in that position is removed.
	   	hand.remove(position);
   }
   public int getCardCount() 
   {
	   //returns the number of cards in the hand (not null)
	   
	   	 return hand.size();
        	 
	   	 
   }
   public Card getCard(int position)
   {
          // Get the card from the hand in given position, where positions
          // are numbered starting from 0.  If the specified position is
          // not the position number of a card in the hand, then null
          // is returned.
	   
	  return hand.get(position);
		   
	   	
   }
   
   //sort hand using bubble sort
   public void sortHand()
   {
	   for(int i = 0; i < hand.size()-1; i++)
	   {
		   for(int j = 0; j < hand.size()-i-1;j++)
		   {
			   if(hand.get(j).getValue() > hand.get(j+1).getValue())
			   {
				   Card temp = hand.get(j);
				   hand.set(j, hand.get(j+1));
				   hand.set(j+1, temp);
			   }
		   }
	   }
	   
   }
	  
   public void swap(int index1, int index2)
   {
	   Card temp = hand.get(index1);
	   hand.set(index1, hand.get(index2));
	   hand.set(index2, temp);
   }
   
   public void printHand()
   {
	   
	   System.out.println(hand.toString());
   }
}
