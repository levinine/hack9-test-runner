to run reset test
newman run Hack9_functional_tests.postman_collection.json --env-var base_url={{URL}} --folder reset --reporters cli,json --reporter-json-export test_reset_results.json

to run price tests
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_price.csv --env-var base_url={{URL}} --folder price --reporters cli,json --reporter-json-export test_price_results.json

to run call tests
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_calls.csv --env-var base_url={{URL}} --folder call --reporters cli,json --reporter-json-export test_call_results.json

to run listing test
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_listing.csv --env-var base_url={{URL}} --folder listing --reporters cli,json --reporter-json-export test_listing_results.json

to run invoice request test
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_invoice_request.csv --env-var base_url={{URL}}  --env-var callback_url={{CALLBACK_URL}} --folder Invoice_request --reporters cli,json --reporter-json-export test_invoice_request_results.json

to run report test
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_report.csv  --env-var base_url={{URL}} --folder report --reporters cli,json --reporter-json-export test_report_results.json

to run invoice test
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_invoice.csv --env-var base_url={{URL}} --folder invoice --reporters cli,json --reporter-json-export test_report_results.json

---------------

Tests which are dependant on each other should be run in defined order: reset, call, listing, invoice request, report, invoice;

---------------
To run locally
---------------
--env-var base_url="http://localhost:8080/reference"
--env-var callback_url="http://localhost:8090/reference/callback/invoices/123e4567-e89b-12d3-a456-426655440027"

