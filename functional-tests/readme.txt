to run all tests run 
./test_all.sh

to run reset test
newman run Hack9_functional_tests.postman_collection.json -e Hack9_env.postman_environment.json --folder reset --reporters cli,json --reporter-json-export test_reset_results.json

to run price tests
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_price.csv -e Hack9_env.postman_environment.json --folder price --reporters cli,json --reporter-json-export test_price_results.json


to run call tests
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_calls.csv -e Hack9_env.postman_environment.json --folder call --reporters cli,json --reporter-json-export test_call_results.json

Priror to running listing test execute  test for reset and calls. 
to run listing test
newman run Hack9_functional_tests.postman_collection.json -d test_data_for_ft_listing.csv -e Hack9_env.postman_environment.json --folder listing --reporters cli,json --reporter-json-export test_listing_results.json

Test results are generated in files named test_reset_results.json, test_price_results.json, test_call_results.json, test_listing_results.json. 
