import React, { useState, useEffect } from 'react';
import './App.css'; 

const App = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [mostCommonAuthor, setMostCommonAuthor] = useState('');
  const [earliestPublicationDate, setEarliestPublicationDate] = useState('');
  const [latestPublicationDate, setLatestPublicationDate] = useState('');
  const [serverResponseTime, setServerResponseTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBook, setExpandedBook] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const startTime = performance.now();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=${itemsPerPage}`);
        const data = await response.json();
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        if (data.error) {
          throw new Error(data.error.message);
        }

        setTotalResults(data.totalItems);

        const allAuthors = data.items.flatMap(item => item.volumeInfo.authors || []);
        const authorCounts = allAuthors.reduce((acc, author) => {
          acc[author] = (acc[author] || 0) + 1;
          return acc;
        }, {});

        const mostCommonAuthor = Object.keys(authorCounts).reduce((a, b) => authorCounts[a] > authorCounts[b] ? a : b);
        setMostCommonAuthor(mostCommonAuthor);

        const publicationDates = data.items.map(item => item.volumeInfo.publishedDate).filter(date => date);
        const parsedPublicationDates = publicationDates.map(date => parsePublicationDate(date)).filter(date => date);
        setEarliestPublicationDate(parsedPublicationDates.length > 0 ? new Date(Math.min(...parsedPublicationDates)).toLocaleDateString() : 'N/A');
        setLatestPublicationDate(parsedPublicationDates.length > 0 ? new Date(Math.max(...parsedPublicationDates)).toLocaleDateString() : 'N/A');

        setResults(data.items);
        setServerResponseTime(responseTime.toFixed(2)); // Round to 2 decimal places
        setError('');
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, query, itemsPerPage]); // Fetch books whenever currentPage, query, or itemsPerPage changes

  // Function to parse publication dates with different formats
  const parsePublicationDate = (date) => {
    const yearRegex = /^\d{4}$/;
    const monthYearRegex = /^\d{4}-\d{2}$/;
    const fullDateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (yearRegex.test(date)) {
      // If only year is provided
      return new Date(`${date}-01-01`);
    } else if (monthYearRegex.test(date)) {
      // If year and month are provided
      return new Date(`${date}-01`);
    } else if (fullDateRegex.test(date)) {
      // If full date is provided
      return new Date(date);
    }

    return null;
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleInputChange = event => {
    setQuery(event.target.value);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalResults / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container">
      <h1>Google Books Search</h1>
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Enter search query..."
          aria-label="Search query"
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <p>Total Results: {totalResults}</p>
      <p>Most Common Author: {mostCommonAuthor}</p>
      <p>Earliest Publication Date: {earliestPublicationDate}</p>
      <p>Latest Publication Date: {latestPublicationDate}</p>
      <p>Server Response Time: {serverResponseTime} ms</p>
      <div className="card-container">
        {results.map((item, index) => (
          <div key={index} className="card" onClick={() => setExpandedBook(index)}>
            <p>Authors: {item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown'}</p>
            <h2>Title: {item.volumeInfo.title}</h2>
            {expandedBook === index &&
              <p>Description: {item.volumeInfo.description || 'No description available'}</p>
            }
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1} className="page-button">Previous</button>
        <span>Page {currentPage}</span>
        <button onClick={handleNextPage} disabled={currentPage === Math.ceil(totalResults / itemsPerPage)} className="page-button">Next</button>
      </div>
    </div>
  );
};

export default App;
