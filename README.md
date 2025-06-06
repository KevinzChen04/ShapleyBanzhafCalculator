# Vector Weighted Voting Game Calculator

A web application for computing Shapley values and Banzhaf indices in arbitrary vector weighted voting games.

## Features

- **Interactive Web Interface**: Easy-to-use form inputs for entering game parameters
- **Flexible Input**: Support for any number of dimensions (k) and players
- **CSV Upload**: Load game data from CSV files
- **Two Power Indices**: Calculate both Shapley values and Banzhaf indices
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Compatible**: Static files that can be hosted anywhere

## How to Use

### Manual Input

1. **Set Dimensions**: Enter the number of quotas/dimensions (k)
2. **Click "Setup Game"** to generate input fields
3. **Enter Quotas**: Fill in the quota values for each dimension
4. **Set Players**: Add or remove players as needed
5. **Enter Weight Vectors**: Fill in each player's weights for each dimension
6. **Select Method**: Choose between Shapley values or Banzhaf index
7. **Click "Calculate"** to compute the results

### CSV Upload

You can also upload a CSV file with the following format:
- **First row**: Quotas for each dimension
- **Subsequent rows**: Weight vectors for each player

Example CSV:
```
5,3
3,2
2,3
1,1
```

This represents:
- 2 dimensions with quotas [5, 3]
- 3 players with weights [3,2], [2,3], and [1,1]

## Mathematical Background

### Vector Weighted Voting Games

In a vector weighted voting game:
- There are `k` dimensions (issues/criteria)
- Each dimension has a quota that must be met
- Each player has a weight vector with weights for each dimension
- A coalition wins if it meets or exceeds ALL quotas

### Shapley Values

The Shapley value measures each player's average marginal contribution across all possible orderings of players. It represents the "fair" share of power each player should have.

### Banzhaf Index

The Banzhaf index measures each player's voting power based on how often they can change a losing coalition into a winning one (swing votes).

## Technical Details

- **Client-side Only**: All calculations run in the browser
- **No External Dependencies**: Pure HTML, CSS, and JavaScript
- **Efficient Algorithms**: Uses optimized permutation and subset generation
- **Input Validation**: Ensures all inputs are non-negative integers

## Example Usage

### Simple 2D Example
- Quotas: [5, 3]
- Player 1: [3, 2]
- Player 2: [2, 3] 
- Player 3: [1, 1]

In this game:
- Dimension 1 needs 5 votes, Dimension 2 needs 3 votes
- Player 1 is strong in dimension 1, Player 2 in dimension 2
- Player 3 has equal but lower weights

### Testing the Application

Use the provided `sample.csv` file to test the application with the example above.

## Hosting on GitHub Pages

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. The application will be available at `https://yourusername.github.io/repository-name/`

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Limitations

- Performance decreases with large numbers of players (due to exponential complexity)
- Recommended maximum: 10-15 players for responsive performance
- All inputs must be non-negative integers

## Files

- `index.html`: Main application page
- `styles.css`: Styling and responsive design
- `script.js`: Core algorithms and UI logic
- `sample.csv`: Example data file
- `README.md`: This documentation 