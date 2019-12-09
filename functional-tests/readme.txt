to run reset test
newman run Hack9_functional_tests.postman_collection.json -e Hack9_env.postman_environment.json --folder reset --reporters cli,json --reporter-json-export test_reset_results.json

to run price tests
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_price.csv -e Hack9_env.postman_environment.json --folder price --reporters cli,json --reporter-json-export test_price_results.json


to run call tests
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_calls.csv -e Hack9_env.postman_environment.json --folder call --reporters cli,json --reporter-json-export test_call_results.json

to run listing test
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_listing.csv -e Hack9_env.postman_environment.json --folder listing --reporters cli,json --reporter-json-export test_listing_results.json

to run invoice request test
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_invoice_request.csv -e Hack9_env.postman_environment.json --folder Invoice_request --reporters cli,json --reporter-json-export test_invoice_request_results.json

to run report test
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_report.csv -e Hack9_env.postman_environment.json --folder report --reporters cli,json --reporter-json-export test_report_results.json

to run report test
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_invoice.csv -e Hack9_env.postman_environment.json --folder invoice --reporters cli,json --reporter-json-export test_report_results.json
