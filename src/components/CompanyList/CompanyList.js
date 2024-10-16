import React, { useState } from 'react';
import './CompanyList.css';

const companies = [
  'Apple Inc.',
  'Microsoft Corp.',
  'Amazon.com Inc.',
  'Google LLC',
  'Tesla Inc.',
  'Facebook Inc.',
  'Netflix Inc.',
  'Nvidia Corp.',
  'Berkshire Hathaway Inc.',
  'Johnson & Johnson',
];

function CompanyList({ onCompanyClick }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter companies based on the search term
  const filteredCompanies = companies.filter(company =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="company-list-container">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search companies..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Company List */}
      <h3>Companies</h3>
      <div className="companies">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company, index) => (
            <div
              key={index}
              className="company-item"
              onClick={() => onCompanyClick(company)}
            >
              {company}
            </div>
          ))
        ) : (
          <div className="no-results">No companies found</div>
        )}
      </div>
    </div>
  );
}

export default CompanyList;
